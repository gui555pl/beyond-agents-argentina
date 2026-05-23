/**
 * Cliente Anthropic compartilhado para o pipeline.
 *
 * - Usa @anthropic-ai/sdk diretamente (não passa por Mastra).
 * - Wrappers chamam o cost tracker automaticamente.
 * - Função `callAgent` é o canal único de chamadas LLM do pipeline.
 *
 * Por que não usar o Agent do Mastra direto? Porque queremos controle granular
 * sobre paralelismo, response_format, retries e tracking de tokens — e isto é
 * mais simples sem o overhead do runtime do Studio.
 */
import Anthropic from '@anthropic-ai/sdk';
import { costTracker } from './cost-tracker.js';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.warn('[anthropic-client] ANTHROPIC_API_KEY não definida — chamadas Claude falharão.');
}

export const anthropic = new Anthropic({
  apiKey: apiKey ?? '',
  // Evita requests pendurados por tempo indefinido.
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
    },
  );
  const durationMs = Date.now() - t0;
  costTracker.registrar(
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
 * Extrai o primeiro bloco JSON do texto. Aceita tanto JSON puro quanto
 * markdown ```json ... ``` ou JSON entre prosa. Lança se não achar.
 */
export function extractJson<T = unknown>(raw: string): T {
  // 1. Tenta JSON puro
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      // segue para fallback
    }
  }
  // 2. Tenta extrair de ```json ... ```
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    return JSON.parse(fenceMatch[1].trim()) as T;
  }
  // 3. Procura o primeiro { ... } balanceado
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
