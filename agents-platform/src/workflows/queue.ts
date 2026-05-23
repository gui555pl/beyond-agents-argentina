/**
 * Fila + Worker Pool para runs simultâneas.
 *
 * - Pool com concorrência máxima `MAX_CONCURRENT_RUNS` (default 3).
 * - `enqueue(submissionId)` adiciona à fila e dispara worker quando há vaga.
 * - Cada worker carrega a submissão do DB, executa `explorarArvore` e
 *   atualiza o status. Eventos do pipeline são persistidos via callback.
 * - `cancel(runId)` aborta a run via `AbortController` e marca como canceled.
 * - Sem dependência de Redis ou message broker — adequado pra single-process.
 */
import { explorarArvore } from './explorar-arvore.js';
import {
  getSubmission,
  updateSubmissionStatus,
  appendEvent,
  type SubmissionRow,
} from '../lib/db.js';
import { disposeTracker } from '../lib/cost-tracker.js';
import type { EventoPipeline } from '../lib/tipos.js';

const MAX_CONCURRENT = Math.max(
  1,
  parseInt(process.env.MAX_CONCURRENT_RUNS ?? '3', 10) || 3,
);

interface RunCtx {
  runId: string;
  submissionId: string;
  abort: AbortController;
  startedAt: number;
}

const filaSubmissionIds: string[] = [];
const ativos = new Map<string, RunCtx>(); // runId -> ctx
let publicar: ((submissionId: string, evento: EventoPipeline) => void) | null = null;
let onStatusChange: ((submissionId: string, status: SubmissionRow['status']) => void) | null = null;

export interface QueueCallbacks {
  onEvent: (submissionId: string, evento: EventoPipeline) => void;
  onStatus?: (submissionId: string, status: SubmissionRow['status']) => void;
}

/** Configura callbacks de publicação de eventos. Chamar 1× no boot do server. */
export function configurarQueue(cbs: QueueCallbacks): void {
  publicar = cbs.onEvent;
  onStatusChange = cbs.onStatus ?? null;
}

export interface EnqueueResultado {
  submissionId: string;
  runId: string;
  position: number; // 0 = começando agora; >=1 = aguardando na fila
}

/** Coloca uma submissão (já persistida com status 'queued') na fila. */
export function enqueue(submissionId: string, runId: string): EnqueueResultado {
  const jaNaFila = filaSubmissionIds.includes(submissionId);
  if (!jaNaFila && !ativos.has(runId)) {
    filaSubmissionIds.push(submissionId);
  }
  const position = ativos.size < MAX_CONCURRENT ? 0 : filaSubmissionIds.indexOf(submissionId) + 1;
  // Dispara qualquer worker disponível
  drenarFila();
  return { submissionId, runId, position };
}

function drenarFila(): void {
  while (ativos.size < MAX_CONCURRENT && filaSubmissionIds.length > 0) {
    const submissionId = filaSubmissionIds.shift()!;
    iniciarWorker(submissionId).catch((err) => {
      console.error(`[queue] worker erro fatal para ${submissionId}:`, err);
    });
  }
}

async function iniciarWorker(submissionId: string): Promise<void> {
  const sub = getSubmission(submissionId);
  if (!sub) {
    console.warn(`[queue] submissão ${submissionId} não encontrada — pulando.`);
    return;
  }
  // Pode ter sido cancelada antes de começar
  if (sub.status === 'canceled' || sub.status === 'failed' || sub.status === 'done') {
    return;
  }

  const ctx: RunCtx = {
    runId: sub.run_id,
    submissionId: sub.id,
    abort: new AbortController(),
    startedAt: Date.now(),
  };
  ativos.set(sub.run_id, ctx);

  updateSubmissionStatus(sub.run_id, 'running');
  if (onStatusChange) onStatusChange(sub.id, 'running');

  try {
    await explorarArvore({
      submissao: sub.submissao_completa,
      hipotese_raiz: sub.hipotese_raiz,
      run_id: sub.run_id,
      signal: ctx.abort.signal,
      listener: (evento) => {
        try {
          appendEvent(sub.run_id, evento);
        } catch (err) {
          console.warn(`[queue] falha ao persistir evento ${evento.tipo}:`, err);
        }
        if (publicar) publicar(sub.id, evento);
      },
    });
    if (!ctx.abort.signal.aborted) {
      updateSubmissionStatus(sub.run_id, 'done');
      if (onStatusChange) onStatusChange(sub.id, 'done');
    }
  } catch (err) {
    const aborted = ctx.abort.signal.aborted || (err instanceof Error && err.name === 'AbortError');
    if (aborted) {
      updateSubmissionStatus(sub.run_id, 'canceled', 'Run abortada pelo usuário.');
      if (onStatusChange) onStatusChange(sub.id, 'canceled');
    } else {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[queue] run ${sub.run_id} falhou:`, msg);
      updateSubmissionStatus(sub.run_id, 'failed', msg);
      if (onStatusChange) onStatusChange(sub.id, 'failed');
    }
  } finally {
    ativos.delete(sub.run_id);
    disposeTracker(sub.run_id);
    drenarFila();
  }
}

/** Aborta a run em andamento (se ativa) ou remove da fila (se ainda não começou). */
export function cancel(runId: string): boolean {
  const ctx = ativos.get(runId);
  if (ctx) {
    ctx.abort.abort();
    return true;
  }
  // Talvez ainda esteja na fila — busca por submissionId equivalente
  const sub = getSubmission(runId);
  if (!sub) return false;
  const idx = filaSubmissionIds.indexOf(sub.id);
  if (idx >= 0) {
    filaSubmissionIds.splice(idx, 1);
    updateSubmissionStatus(runId, 'canceled', 'Run cancelada antes de iniciar.');
    if (onStatusChange) onStatusChange(sub.id, 'canceled');
    return true;
  }
  return false;
}

export interface QueueStats {
  ativos: number;
  fila: number;
  capacidade: number;
}

export function stats(): QueueStats {
  return {
    ativos: ativos.size,
    fila: filaSubmissionIds.length,
    capacidade: MAX_CONCURRENT,
  };
}

export function listAtivos(): string[] {
  return [...ativos.keys()];
}

export function listFila(): string[] {
  return [...filaSubmissionIds];
}

export function isAtivo(runId: string): boolean {
  return ativos.has(runId);
}
