/**
 * Criador de LP — tool determinística (mock).
 *
 * Escolhe 1 das 6 LPs pré-feitas do pool em src/fixtures/lps/, injeta
 * HEADLINE/SUBHEAD/CTA, devolve HTML + data URL pra iframe.
 *
 * Exposto de DUAS formas:
 *   - `gerarLp()` — função pura, usada pelo pipeline-no.ts (controle total de tipos)
 *   - `criadorLpTool` — wrapper Mastra, aparece no Studio
 */
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const LPS_DIR = resolve(FIXTURES_DIR, 'lps');
const LP_INDEX_PATH = resolve(FIXTURES_DIR, 'lp-index.json');

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
