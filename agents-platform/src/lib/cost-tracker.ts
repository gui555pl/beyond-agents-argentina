/**
 * Cost tracker em-process — isolado por run.
 *
 * Antes era singleton de módulo. Com multi-tenant (várias runs simultâneas),
 * cada run precisa do próprio tracker. `getTracker(runId)` cria sob demanda;
 * `disposeTracker(runId)` libera ao fim da run.
 *
 * Tabelas de preço (USD por 1M tokens) — Anthropic, dez/2025.
 */

const PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-5': { input: 3.0, output: 15.0 },
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  'claude-opus-4-7': { input: 15.0, output: 75.0 },
  'claude-haiku-4-5': { input: 1.0, output: 5.0 },
  'claude-3-5-haiku-20241022': { input: 0.8, output: 4.0 },
};

export interface CallRecord {
  agente: string;
  modelo: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  duration_ms: number;
  timestamp: string;
}

export interface CostTotals {
  calls: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
}

export class CostTracker {
  private records: CallRecord[] = [];

  registrar(
    agente: string,
    modelo: string,
    inputTokens: number,
    outputTokens: number,
    durationMs: number,
  ): CallRecord {
    const pricing = PRICING[modelo];
    let costUsd: number;
    if (!pricing) {
      console.warn(`[cost-tracker] Modelo desconhecido "${modelo}" — usando preço Haiku 4.5.`);
      costUsd = (inputTokens / 1_000_000) * 1.0 + (outputTokens / 1_000_000) * 5.0;
    } else {
      costUsd =
        (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
    }
    const record: CallRecord = {
      agente,
      modelo,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: costUsd,
      duration_ms: durationMs,
      timestamp: new Date().toISOString(),
    };
    this.records.push(record);
    return record;
  }

  total(): CostTotals {
    return this.records.reduce<CostTotals>(
      (acc, r) => ({
        calls: acc.calls + 1,
        input_tokens: acc.input_tokens + r.input_tokens,
        output_tokens: acc.output_tokens + r.output_tokens,
        cost_usd: acc.cost_usd + r.cost_usd,
      }),
      { calls: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0 },
    );
  }

  byAgent(): Record<string, CostTotals> {
    return this.records.reduce<Record<string, CostTotals>>((acc, r) => {
      const cur = acc[r.agente] ?? { calls: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0 };
      acc[r.agente] = {
        calls: cur.calls + 1,
        input_tokens: cur.input_tokens + r.input_tokens,
        output_tokens: cur.output_tokens + r.output_tokens,
        cost_usd: cur.cost_usd + r.cost_usd,
      };
      return acc;
    }, {});
  }

  dump(): CallRecord[] {
    return [...this.records];
  }
}

// ─────────────────────────────── Registry ──────────────────────────────

const trackers = new Map<string, CostTracker>();

/** Singleton fallback usado fora de uma run (CLI, Mastra Studio). */
const fallback = new CostTracker();

export function getTracker(runId?: string | null): CostTracker {
  if (!runId) return fallback;
  let t = trackers.get(runId);
  if (!t) {
    t = new CostTracker();
    trackers.set(runId, t);
  }
  return t;
}

export function disposeTracker(runId: string): void {
  trackers.delete(runId);
}

export function listTrackerIds(): string[] {
  return [...trackers.keys()];
}

/**
 * Backwards compat: o CLI runner (run-pipeline.ts) usa o tracker singleton.
 * Mantém a API antiga (`costTracker.reset()` / `.registrar()`) sem quebrar.
 */
export const costTracker = Object.assign(fallback, {
  reset(): void {
    // Cria um tracker novo para o singleton sem mexer no registry de runs.
    (fallback as unknown as { records: CallRecord[] }).records = [];
  },
});
