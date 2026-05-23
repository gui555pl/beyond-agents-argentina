/**
 * Backend HTTP+SSE para a UI demo.
 *
 * - `GET /api/fixture` — devolve o formulário Aurora pré-carregado (HealthTech).
 * - `POST /api/runs` — inicia uma execução do pipeline em background. Devolve { runId }.
 * - `GET /api/runs/:runId/events` — SSE: stream dos EventoPipeline em tempo real,
 *   com backlog para clientes late-joiners.
 * - `DELETE /api/runs/:runId` — encerra a run (best-effort: marca como cancelada;
 *   o pipeline em execução não é abortado, mas o stream fecha).
 *
 * EventBus em memória — keyed por runId. Sem persistência: refresh do server
 * apaga tudo.
 */
import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { explorarArvore } from './workflows/explorar-arvore.js';
import { costTracker } from './lib/cost-tracker.js';
import type { EventoPipeline, SubmissaoAurora } from './lib/tipos.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = resolve(HERE, 'fixtures', 'submissao-healthtech.json');

const PORT = Number(process.env.PORT ?? 4001);

// ─── EventBus por runId ─────────────────────────────────────────────────────

type SseListener = (evento: EventoPipeline) => void;

interface RunState {
  runId: string;
  events: EventoPipeline[];
  listeners: Set<SseListener>;
  finalizada: boolean;
  iniciada_em: string;
}

const runs = new Map<string, RunState>();

function getRunAtiva(): RunState | null {
  for (const run of runs.values()) {
    if (!run.finalizada) return run;
  }
  return null;
}

function novaRun(): RunState {
  const runId = randomUUID();
  const state: RunState = {
    runId,
    events: [],
    listeners: new Set(),
    finalizada: false,
    iniciada_em: new Date().toISOString(),
  };
  runs.set(runId, state);
  return state;
}

function publicar(state: RunState, evento: EventoPipeline): void {
  state.events.push(evento);
  for (const l of state.listeners) {
    try {
      l(evento);
    } catch {
      // listener morto — ignora, o handler SSE remove sozinho
    }
  }
  if (evento.tipo === 'pipeline_finalizado') {
    state.finalizada = true;
  }
}

// ─── App ────────────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  const ativa = getRunAtiva();
  res.json({ ok: true, runs: runs.size, activeRunId: ativa?.runId ?? null });
});

app.get('/api/fixture', (_req, res) => {
  try {
    const raw = JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8')) as {
      submissao_aurora: SubmissaoAurora;
      hipotese_raiz: string;
    };
    res.json(raw);
  } catch (err) {
    res.status(500).json({ erro: err instanceof Error ? err.message : String(err) });
  }
});

app.post('/api/runs', async (req: Request, res: Response) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ erro: 'ANTHROPIC_API_KEY não definida no .env do servidor.' });
    return;
  }

  // Evita concorrência de runs ao vivo (causa rate-limit e aparente "travamento" na demo).
  const ativa = getRunAtiva();
  if (ativa) {
    res.status(200).json({ runId: ativa.runId, reused: true });
    return;
  }

  // body opcional permite passar submissao customizada; senão usa o fixture
  const body = (req.body ?? {}) as {
    submissao_aurora?: SubmissaoAurora;
    hipotese_raiz?: string;
  };
  let submissao: SubmissaoAurora;
  let hipotese_raiz: string;
  if (body.submissao_aurora && body.hipotese_raiz) {
    submissao = body.submissao_aurora;
    hipotese_raiz = body.hipotese_raiz;
  } else {
    const raw = JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8')) as {
      submissao_aurora: SubmissaoAurora;
      hipotese_raiz: string;
    };
    submissao = raw.submissao_aurora;
    hipotese_raiz = raw.hipotese_raiz;
  }

  const state = novaRun();
  console.log(`[server] iniciando run ${state.runId}`);
  res.json({ runId: state.runId, reused: false });

  // Dispara o pipeline em background — não bloqueia a resposta
  costTracker.reset();
  explorarArvore({
    submissao,
    hipotese_raiz,
    listener: (e) => publicar(state, e),
  })
    .then(() => {
      console.log(`[server] run ${state.runId} concluída`);
    })
    .catch((err) => {
      console.error(`[server] run ${state.runId} erro:`, err);
      // Emite um evento sintético pra o frontend não ficar pendurado
      publicar(state, {
        tipo: 'pipeline_finalizado',
        ranking: [],
        custo_total: costTracker.total(),
        custo_por_agente: costTracker.byAgent(),
        duracao_ms: 0,
      });
    });
});

app.get('/api/runs/:runId/events', (req: Request, res: Response) => {
  const runId = String(req.params.runId);
  const state = runs.get(runId);
  if (!state) {
    res.status(404).json({ erro: 'runId desconhecido' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  // CORS já cuida pelo middleware, mas vale reforçar headers SSE
  res.flushHeaders?.();

  const send = (evento: EventoPipeline): void => {
    res.write(`data: ${JSON.stringify(evento)}\n\n`);
  };

  // 1. Backlog
  for (const evt of state.events) send(evt);

  // 2. Listener para novos
  const listener: SseListener = (evt) => {
    send(evt);
    if (evt.tipo === 'pipeline_finalizado') {
      state.listeners.delete(listener);
      // dá tempo do client processar antes de fechar
      setTimeout(() => res.end(), 500);
    }
  };

  if (state.finalizada) {
    // Se já terminou, encerra após mandar o backlog
    setTimeout(() => res.end(), 200);
  } else {
    state.listeners.add(listener);
  }

  // 3. Heartbeat — mantém conexão viva em proxies e detecta cliente desconectado
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15_000);

  req.on('close', () => {
    state.listeners.delete(listener);
    clearInterval(heartbeat);
  });
});

app.delete('/api/runs/:runId', (req, res) => {
  const runId = String(req.params.runId);
  const state = runs.get(runId);
  if (!state) {
    res.status(404).json({ erro: 'runId desconhecido' });
    return;
  }
  // Não há como abortar promises Anthropic em curso; só marca e
  // fecha listeners para o frontend voltar pra home
  state.finalizada = true;
  for (const l of state.listeners) {
    try {
      l({
        tipo: 'pipeline_finalizado',
        ranking: [],
        custo_total: costTracker.total(),
        custo_por_agente: costTracker.byAgent(),
        duracao_ms: 0,
      });
    } catch {
      /* ignore */
    }
  }
  state.listeners.clear();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`[server] Beyond Agents SSE server em http://localhost:${PORT}`);
  console.log(`[server] Endpoints:`);
  console.log(`  GET    /api/health`);
  console.log(`  GET    /api/fixture`);
  console.log(`  POST   /api/runs`);
  console.log(`  GET    /api/runs/:runId/events  (SSE)`);
  console.log(`  DELETE /api/runs/:runId`);
});
