/**
 * Criador de LP — Leandro LP (LLM) + fallback pra pool de fixtures.
 *
 * Caminho principal:
 *   `gerarLpComLLM()` chama o agente Leandro (Sonnet 4.5) com Copy Guide como
 *   contexto e devolve HTML completo standalone.
 *
 * Fallback (mantido pra robustez de pitch):
 *   `gerarLp()` escolhe 1 das 12 LPs fixas em src/fixtures/lps/ (6 HealthTech
 *   + 6 Erudio), injeta HEADLINE/SUBHEAD/CTA e devolve. Usado quando a chamada
 *   LLM falha (timeout, rate limit, HTML inválido).
 *
 * Exposto:
 *   - `gerarLpComLLM()` — função async, caminho principal do pipeline
 *   - `gerarLp()`       — função pura síncrona, fallback + Mastra Studio
 *   - `criadorLpTool`   — wrapper Mastra do `gerarLp`
 */
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { callAgent } from '../lib/anthropic-client.js';
import type { CopyGuide } from '../lib/tipos.js';

const FIXTURES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const LPS_DIR = resolve(FIXTURES_DIR, 'lps');
const LP_INDEX_PATH = resolve(FIXTURES_DIR, 'lp-index.json');
const AGENTS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'agents');

function loadAgentPrompt(nome: string): string {
  const raw = readFileSync(resolve(AGENTS_DIR, nome, 'prompt.md'), 'utf-8');
  const idx = raw.split('\n').findIndex((l) => l.trim() === '---');
  return idx === -1 ? raw.trim() : raw.split('\n').slice(idx + 1).join('\n').trim();
}

let _promptLeandro: string | null = null;
function getPromptLeandro(): string {
  if (_promptLeandro === null) _promptLeandro = loadAgentPrompt('leandro-lp');
  return _promptLeandro;
}

interface LpIndexEntry {
  id: string;
  arquivo_lp: string;
  arquivo_ads: string;
  vertical?: string;
  angulo: string;
  publico: string;
  tags: string[];
}

export interface GerarLpInput {
  hipotese: string;
  headline: string;
  subhead: string;
  cta: string;
  lp_id?: string;
  vertical?: string;
}

export interface GerarLpOutput {
  lp_id: string;
  angulo: string;
  publico: string;
  html: string;
  preview_url: string;
}

function loadIndex(): LpIndexEntry[] {
  if (!existsSync(LP_INDEX_PATH)) {
    throw new Error(`lp-index.json não encontrado em ${LP_INDEX_PATH}`);
  }
  return JSON.parse(readFileSync(LP_INDEX_PATH, 'utf-8')) as LpIndexEntry[];
}

function filtrarPorVertical(index: LpIndexEntry[], vertical?: string): LpIndexEntry[] {
  if (!vertical) return index;
  const v = vertical.toLowerCase();
  const filtered = index.filter((e) => (e.vertical ?? 'healthtech').toLowerCase() === v);
  // Fallback: se a vertical não tem LPs específicas, usa o pool HealthTech (calibrado).
  return filtered.length > 0 ? filtered : index.filter((e) => (e.vertical ?? 'healthtech') === 'healthtech');
}

function pickLp(index: LpIndexEntry[], hipotese: string, lpIdHint?: string): LpIndexEntry {
  if (lpIdHint) {
    const hit = index.find((e) => e.id === lpIdHint);
    if (hit) return hit;
  }
  const hipoteseLower = hipotese.toLowerCase();
  const scored = index.map((entry) => {
    const score = entry.tags.reduce((acc, tag) => {
      const tagWords = tag.split('-');
      const hit = tagWords.some((w) => w.length > 3 && hipoteseLower.includes(w));
      return acc + (hit ? 1 : 0);
    }, 0);
    return { entry, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0].entry : index[0];
}

function injectPlaceholders(html: string, headline: string, subhead: string, cta: string): string {
  return html
    .replaceAll('{{HEADLINE}}', headline)
    .replaceAll('{{SUBHEAD}}', subhead)
    .replaceAll('{{CTA}}', cta);
}

/** Função pura — não passa pelo runtime do Mastra. */
export function gerarLp(input: GerarLpInput): GerarLpOutput {
  const fullIndex = loadIndex();
  const index = filtrarPorVertical(fullIndex, input.vertical);
  const chosen = pickLp(index, input.hipotese, input.lp_id);
  const lpPath = resolve(LPS_DIR, chosen.arquivo_lp);
  if (!existsSync(lpPath)) throw new Error(`LP não encontrada: ${lpPath}`);
  const rawHtml = readFileSync(lpPath, 'utf-8');
  const html = injectPlaceholders(rawHtml, input.headline, input.subhead, input.cta);
  const dataUrl = `data:text/html;charset=utf-8;base64,${Buffer.from(html, 'utf-8').toString('base64')}`;
  return {
    lp_id: chosen.id,
    angulo: chosen.angulo,
    publico: chosen.publico,
    html,
    preview_url: dataUrl,
  };
}

export interface GerarLpComLLMInput {
  hipotese: { titulo: string; publico_alvo: string; angulo: string };
  headline_sugerida: string;
  subhead_sugerida: string;
  cta_sugerido: string;
  nome_solucao: string;
  descricao_curta: string;
  vertical: string;
  copy_guide: CopyGuide | null;
  run_id?: string;
  signal?: AbortSignal;
}

function htmlParecValido(html: string): boolean {
  const trimmed = html.trim().toLowerCase();
  return (
    trimmed.startsWith('<!doctype html') ||
    trimmed.startsWith('<html') ||
    trimmed.includes('</html>')
  );
}

/**
 * Leandro LP via LLM — caminho principal.
 *
 * Recebe contexto da hipótese + Copy Guide da Beatriz, gera HTML standalone
 * completo via Sonnet 4.5. Em caso de falha (timeout, abort, rate limit,
 * HTML claramente inválido), cai pro fallback `gerarLp()` (pool de fixtures).
 *
 * O pipeline **nunca trava** por culpa do Leandro — a LP sempre vem, mesmo
 * que mockada.
 */
export async function gerarLpComLLM(input: GerarLpComLLMInput): Promise<GerarLpOutput> {
  const userInput = {
    vertical: input.vertical,
    hipotese: input.hipotese,
    headline_sugerida: input.headline_sugerida,
    subhead_sugerida: input.subhead_sugerida,
    cta_sugerido: input.cta_sugerido,
    nome_solucao: input.nome_solucao,
    descricao_curta: input.descricao_curta,
    copy_guide: input.copy_guide,
  };
  const userPrompt = `Gere a landing page conforme seu system prompt. Devolva APENAS o HTML completo standalone, começando com <!DOCTYPE html>. Sem markdown, sem prosa antes ou depois.\n\n${JSON.stringify(userInput, null, 2)}`;

  try {
    const html = await callAgent({
      agente: 'llp',
      modelo: 'claude-sonnet-4-5',
      system: getPromptLeandro(),
      user: userPrompt,
      max_tokens: 8192,
      temperature: 0.7,
      timeout_ms: 90_000,
      run_id: input.run_id,
      signal: input.signal,
    });
    if (!htmlParecValido(html)) {
      throw new Error('Leandro: output não parece HTML válido.');
    }
    const lpId = `lp-leandro-${Date.now().toString(36)}`;
    const dataUrl = `data:text/html;charset=utf-8;base64,${Buffer.from(html, 'utf-8').toString('base64')}`;
    return {
      lp_id: lpId,
      angulo: input.hipotese.angulo,
      publico: input.hipotese.publico_alvo,
      html,
      preview_url: dataUrl,
    };
  } catch (err) {
    console.warn(
      `[leandro-lp] falha (${err instanceof Error ? err.message : String(err)}) — fallback pro pool de fixtures.`,
    );
    return gerarLp({
      hipotese: `${input.hipotese.titulo} — ${input.hipotese.publico_alvo} — ${input.hipotese.angulo}`,
      headline: input.headline_sugerida,
      subhead: input.subhead_sugerida,
      cta: input.cta_sugerido,
      vertical: input.vertical,
    });
  }
}

const inputSchema = z.object({
  hipotese: z.string().describe('Hipótese do nó da árvore — guia a escolha de qual LP do pool usar.'),
  headline: z.string().describe('Headline injetada na LP. 1 frase curta.'),
  subhead: z.string().describe('Subhead injetada na LP. 1-2 frases.'),
  cta: z.string().default('Começar agora').describe('Texto do CTA principal.'),
  lp_id: z.string().optional().describe('Forçar lp específica do índice.'),
  vertical: z.string().optional().describe('Filtra o pool por vertical (edtech, healthtech, ...).'),
});

const outputSchema = z.object({
  lp_id: z.string(),
  angulo: z.string(),
  publico: z.string(),
  html: z.string(),
  preview_url: z.string(),
});

export const criadorLpTool = createTool({
  id: 'criador-lp',
  description:
    'Gera uma landing page para a hipótese atual. Internamente escolhe 1 de 6 LPs pré-fabricadas do pool e injeta headline/subhead/CTA.',
  inputSchema,
  outputSchema,
  execute: async (inputData) => gerarLp(inputData as GerarLpInput),
});
