/**
 * Cliente Anthropic compartilhado para o pipeline.
 *
 * - Usa @anthropic-ai/sdk diretamente (não passa por Mastra).
 * - Cost tracker é por `runId` para suportar múltiplas runs simultâneas.
 *   Sem `runId`, cai num tracker singleton (CLI / Mastra Studio).
 * - `AbortSignal` propaga até o SDK — DELETE da run aborta as chamadas LLM
 *   em andamento de verdade.
 */
import Anthropic from '@anthropic-ai/sdk';
import { getTracker } from './cost-tracker.js';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.warn('[anthropic-client] ANTHROPIC_API_KEY não definida — chamadas Claude falharão.');
}

export const anthropic = new Anthropic({
  apiKey: apiKey ?? '',
  timeout: 45_000,
});

export interface CallAgentParams {
  agente: string;
  modelo?: string;
  system: string;
  user: string;
  max_tokens?: number;
  temperature?: number;
  timeout_ms?: number;
  /** Run em que esta chamada está acontecendo — endereça o cost tracker. */
  run_id?: string | null;
  /** Sinal de abort propagado até o SDK Anthropic. */
  signal?: AbortSignal;
}

/**
 * Faz uma chamada LLM rastreada. Devolve só o texto da primeira resposta.
 * Erros propagam — caller decide se faz retry.
 */
export async function callAgent({
  agente,
  modelo = 'claude-haiku-4-5',
  system,
  user,
  max_tokens = 4096,
  temperature = 0.4,
  timeout_ms = 45_000,
  run_id,
  signal,
}: CallAgentParams): Promise<string> {
  const t0 = Date.now();
  const resp = await anthropic.messages.create(
    {
      model: modelo,
      max_tokens,
      temperature,
      system,
      messages: [{ role: 'user', content: user }],
    },
    {
      timeout: timeout_ms,
      signal,
    },
  );
  const durationMs = Date.now() - t0;
  getTracker(run_id).registrar(
    agente,
    modelo,
    resp.usage.input_tokens,
    resp.usage.output_tokens,
    durationMs,
  );
  const text = resp.content
    .filter((c): c is Anthropic.TextBlock => c.type === 'text')
    .map((c) => c.text)
    .join('');
  return text;
}

/**
 * Extrai o primeiro bloco JSON do texto. Aceita JSON puro, markdown
 * ```json ... ``` ou JSON entre prosa. Lança se não achar.
 */
export function extractJson<T = unknown>(raw: string): T {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      // segue para fallback
    }
  }
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    return JSON.parse(fenceMatch[1].trim()) as T;
  }
  const start = raw.indexOf('{');
  if (start === -1) throw new Error('Resposta sem JSON detectável.');
  let depth = 0;
  for (let i = start; i < raw.length; i++) {
    if (raw[i] === '{') depth++;
    else if (raw[i] === '}') {
      depth--;
      if (depth === 0) {
        return JSON.parse(raw.slice(start, i + 1)) as T;
      }
    }
  }
  throw new Error('JSON não fechou no texto da resposta.');
}
