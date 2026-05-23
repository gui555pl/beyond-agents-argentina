/**
 * Backend HTTP+SSE para a UI demo — versão multi-tenant.
 *
 * Endpoints:
 * - `GET  /api/health`                    — status do servidor + queue
 * - `GET  /api/fixture?vertical=...`      — devolve defaults pré-carregados
 *                                            (edtech → Erudio, healthtech → MedFlow)
 * - `POST /api/submissions`               — recebe form simplificado, expande,
 *                                            cria run, enfileira. Devolve runId+URL.
 * - `GET  /api/submissions/:id`           — estado + dados da submissão
 * - `GET  /api/runs`                      — lista runs ativas + recentes
 * - `GET  /api/runs/:runId/events`        — SSE: stream de EventoPipeline
 * - `DELETE /api/runs/:runId`             — aborta a run (de verdade — via AbortSignal)
 *
 * Persistência em SQLite (`agents-platform/data/runs.sqlite`).
 * Worker pool com concorrência `MAX_CONCURRENT_RUNS` (default 3).
 *
 * Endpoint legacy `POST /api/runs` (sem body, usa fixture) mantido para
 * compat com clientes antigos / CLI interno.
 */
import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  initDb,
  createSubmission,
  getSubmission,
  listSubmissions,
  listEvents,
  recoverStaleRuns,
  gcOldEvents,
  countQueuedAhead,
} from './lib/db.js';
import {
  configurarQueue,
  enqueue,
  cancel as cancelRun,
  stats as queueStats,
  isAtivo,
} from './workflows/queue.js';
import { SubmissionRequestSchema } from './lib/schemas.js';
import { expandirSubmissao } from './workflows/submission-expander.js';
import { disposeTracker } from './lib/cost-tracker.js';
import type { EventoPipeline, SubmissaoAurora } from './lib/tipos.js';
import type { Vertical } from './lib/schemas.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(HERE, 'fixtures');
const PORT = Number(process.env.PORT ?? 4001);

// ─── DB + Queue boot ────────────────────────────────────────────────────

initDb();
const recovered = recoverStaleRuns();
if (recovered > 0) {
  console.log(`[server] ${recovered} runs presas em queued/running marcadas como failed.`);
}

// ─── SSE EventBus em-memory por runId ───────────────────────────────────

type SseListener = (evento: EventoPipeline) => void;

interface RunMemoria {
  runId: string;
  submissionId: string;
  listeners: Set<SseListener>;
  finalizada: boolean;
  finalizadaEm: number | null;
}

const runs = new Map<string, RunMemoria>();

function obterOuCriarRunMem(runId: string, submissionId: string): RunMemoria {
  let st = runs.get(runId);
  if (!st) {
    st = {
      runId,
      submissionId,
      listeners: new Set(),
      finalizada: false,
      finalizadaEm: null,
    };
    runs.set(runId, st);
  }
  return st;
}

function publicarEvento(submissionId: string, evento: EventoPipeline): void {
  const sub = getSubmission(submissionId);
  if (!sub) return;
  const st = obterOuCriarRunMem(sub.run_id, submissionId);
  for (const l of st.listeners) {
    try {
      l(evento);
    } catch {
      // listener morto — ignora; handler SSE remove sozinho
    }
  }
  if (evento.tipo === 'pipeline_finalizado') {
    st.finalizada = true;
    st.finalizadaEm = Date.now();
  }
}

configurarQueue({ onEvent: publicarEvento });

// ─── App ────────────────────────────────────────────────────────────────

const app = express();

// CORS allow-list por env. Em dev, default cobre o Vite (5173).
// Em produção, setar ALLOWED_ORIGINS com a(s) URL(s) da Vercel separadas por vírgula.
// `*` libera tudo — só usar em troubleshooting local.
const ORIGENS_PERMITIDAS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const corsOptions: cors.CorsOptions =
  ORIGENS_PERMITIDAS.includes('*')
    ? { origin: true }
    : {
        origin: (origin, callback) => {
          // Permite requests sem origin (curl, health-check interno do Fly).
          if (!origin) return callback(null, true);
          if (ORIGENS_PERMITIDAS.includes(origin)) return callback(null, true);
          return callback(new Error(`CORS bloqueado para origin ${origin}`));
        },
        credentials: false,
      };
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));

// Rate limit em `POST /api/submissions`. Default generoso para demo/apresentação
// (vários cliques acidentais no mesmo IP). Em produção pública, setar
// SUBMISSION_RATE_LIMIT=3 no env do servidor.
const SUBMISSION_RATE_LIMIT = Math.max(
  0,
  parseInt(process.env.SUBMISSION_RATE_LIMIT ?? '15', 10) || 15,
);
const submissionLimiter =
  SUBMISSION_RATE_LIMIT > 0
    ? rateLimit({
        windowMs: 60_000,
        limit: SUBMISSION_RATE_LIMIT,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: {
          erro: `Muitas submissões — aguarde 1 minuto (limite: ${SUBMISSION_RATE_LIMIT}/min por IP).`,
        },
      })
    : (_req: Request, _res: Response, next: () => void) => next();

app.get('/api/health', (_req, res) => {
  const q = queueStats();
  res.json({ ok: true, queue: q, runsEmMemoria: runs.size });
});

app.get('/api/fixture', (req, res) => {
  const verticalQuery = String(req.query.vertical ?? 'healthtech').toLowerCase() as Vertical;
  const arquivo =
    verticalQuery === 'edtech' ? 'defaults-erudio.json' : 'defaults-medflow.json';
  try {
    const raw = JSON.parse(readFileSync(resolve(FIXTURES_DIR, arquivo), 'utf-8')) as {
      submissao_aurora: SubmissaoAurora;
      hipotese_raiz: string;
    };
    res.json(raw);
  } catch (err) {
    res.status(500).json({ erro: err instanceof Error ? err.message : String(err) });
  }
});

app.post('/api/submissions', submissionLimiter, async (req: Request, res: Response) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ erro: 'ANTHROPIC_API_KEY não definida no .env do servidor.' });
    return;
  }
  const parsed = SubmissionRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Form inválido', detalhes: parsed.error.format() });
    return;
  }
  const { form_simplificado } = parsed.data;
  const { submissao, hipotese_raiz } = expandirSubmissao(form_simplificado);
  const submissionId = randomUUID();
  const runId = randomUUID();
  createSubmission({
    id: submissionId,
    run_id: runId,
    email: form_simplificado.email ?? null,
    nome_solucao: form_simplificado.nome_solucao,
    vertical: form_simplificado.vertical,
    form_simplificado,
    submissao_completa: submissao,
    hipotese_raiz,
  });
  obterOuCriarRunMem(runId, submissionId);
  const { position } = enqueue(submissionId, runId);
  res.status(202).json({
    submissionId,
    runId,
    runUrl: `/runs/${runId}`,
    status: position === 0 ? 'starting' : 'queued',
    position,
  });
});

app.get('/api/submissions/:id', (req, res) => {
  const sub = getSubmission(String(req.params.id));
  if (!sub) {
    res.status(404).json({ erro: 'submissão não encontrada' });
    return;
  }
  const aheadInQueue = sub.status === 'queued' ? countQueuedAhead(sub.run_id) : 0;
  res.json({
    submissionId: sub.id,
    runId: sub.run_id,
    status: sub.status,
    queuePosition: sub.status === 'queued' ? aheadInQueue + 1 : 0,
    nomeSolucao: sub.nome_solucao,
    vertical: sub.vertical,
    email: sub.email,
    formSimplificado: sub.form_simplificado,
    hipoteseRaiz: sub.hipotese_raiz,
    criadoEm: sub.created_at,
    iniciadoEm: sub.started_at,
    finalizadoEm: sub.finished_at,
    erro: sub.erro,
  });
});

app.get('/api/runs', (_req, res) => {
  const lista = listSubmissions(50);
  res.json(
    lista.map((s) => ({
      submissionId: s.id,
      runId: s.run_id,
      status: s.status,
      nomeSolucao: s.nome_solucao,
      vertical: s.vertical,
      criadoEm: s.created_at,
      iniciadoEm: s.started_at,
      finalizadoEm: s.finished_at,
    })),
  );
});

app.get('/api/runs/:runId/events', (req: Request, res: Response) => {
  const runId = String(req.params.runId);
  const sub = getSubmission(runId);
  if (!sub) {
    res.status(404).json({ erro: 'runId desconhecido' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  const send = (evento: EventoPipeline): void => {
    res.write(`data: ${JSON.stringify(evento)}\n\n`);
  };

  // 1. Backlog do SQLite (eventos já emitidos)
  const backlog = listEvents(runId);
  for (const evt of backlog) send(evt);

  // 2. Listener para novos eventos (se a run ainda está rodando)
  const st = obterOuCriarRunMem(runId, sub.id);
  const ativo = isAtivo(runId);

  if (!ativo && (sub.status === 'done' || sub.status === 'failed' || sub.status === 'canceled')) {
    // Já terminou — fecha após enviar backlog
    setTimeout(() => res.end(), 200);
    return;
  }

  const listener: SseListener = (evt) => {
    send(evt);
    if (evt.tipo === 'pipeline_finalizado') {
      st.listeners.delete(listener);
      setTimeout(() => res.end(), 500);
    }
  };
  st.listeners.add(listener);

  // 3. Heartbeat
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15_000);

  req.on('close', () => {
    st.listeners.delete(listener);
    clearInterval(heartbeat);
  });
});

app.delete('/api/runs/:runId', (req, res) => {
  const runId = String(req.params.runId);
  const sub = getSubmission(runId);
  if (!sub) {
    res.status(404).json({ erro: 'runId desconhecido' });
    return;
  }
  const cancelado = cancelRun(runId);
  res.json({ ok: true, cancelado });
});

// ─── Endpoint LEGACY ────────────────────────────────────────────────────
// Apresentador interno que dispara a fixture diretamente, sem passar pelo
// formulário. Mantido para compat com o CLI antigo e testes manuais.

app.post('/api/runs', async (req: Request, res: Response) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ erro: 'ANTHROPIC_API_KEY não definida.' });
    return;
  }
  const body = (req.body ?? {}) as {
    submissao_aurora?: SubmissaoAurora;
    hipotese_raiz?: string;
    vertical?: string;
  };
  let submissao: SubmissaoAurora;
  let hipotese_raiz: string;
  if (body.submissao_aurora && body.hipotese_raiz) {
    submissao = body.submissao_aurora;
    hipotese_raiz = body.hipotese_raiz;
  } else {
    const arquivo =
      body.vertical === 'edtech' ? 'defaults-erudio.json' : 'defaults-medflow.json';
    const raw = JSON.parse(readFileSync(resolve(FIXTURES_DIR, arquivo), 'utf-8')) as {
      submissao_aurora: SubmissaoAurora;
      hipotese_raiz: string;
    };
    submissao = raw.submissao_aurora;
    hipotese_raiz = raw.hipotese_raiz;
  }
  const submissionId = randomUUID();
  const runId = randomUUID();
  createSubmission({
    id: submissionId,
    run_id: runId,
    email: null,
    nome_solucao: submissao.solucao.nome,
    vertical: submissao.solucao.vertical,
    form_simplificado: { legacy_endpoint: true },
    submissao_completa: submissao,
    hipotese_raiz,
  });
  obterOuCriarRunMem(runId, submissionId);
  enqueue(submissionId, runId);
  res.json({ runId, submissionId, reused: false });
});

// ─── Cleanup timer ──────────────────────────────────────────────────────
// A cada 5 min, remove da memória runs finalizadas há mais de 30 min.
// Não apaga submissions nem events do DB — o usuário pode revisitar via URL.

const STALE_AFTER_MS = 30 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  let limpos = 0;
  for (const [runId, st] of runs.entries()) {
    if (st.finalizada && st.finalizadaEm && now - st.finalizadaEm > STALE_AFTER_MS) {
      runs.delete(runId);
      disposeTracker(runId);
      limpos++;
    }
  }
  if (limpos > 0) console.log(`[server] cleanup: ${limpos} runs finalizadas removidas da memória.`);
  // Também faz GC dos events do SQLite antigos (>24h)
  const eventsLimpos = gcOldEvents();
  if (eventsLimpos > 0) console.log(`[server] cleanup: ${eventsLimpos} events antigos apagados do DB.`);
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`[server] Beyond Agents multi-tenant SSE server em http://localhost:${PORT}`);
  console.log(`[server] Worker pool: ${queueStats().capacidade} runs simultâneas`);
  console.log(`[server] Endpoints:`);
  console.log(`  GET    /api/health`);
  console.log(`  GET    /api/fixture?vertical=edtech|healthtech`);
  console.log(`  POST   /api/submissions    (form simplificado)`);
  console.log(`  GET    /api/submissions/:id`);
  console.log(`  GET    /api/runs`);
  console.log(`  GET    /api/runs/:runId/events  (SSE)`);
  console.log(`  DELETE /api/runs/:runId`);
  console.log(`  POST   /api/runs    (legacy: dispara fixture direto)`);
});
