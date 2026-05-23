/**
 * Criador de Ads — tool determinística (mock).
 *
 * LPs do pool (lp-1, erudio-1, …) têm par 1:1 com ads no índice.
 * LPs geradas pelo Leandro LLM (`lp-leandro-*`) não estão no índice —
 * nesse caso pareamos ads do pool pela vertical + hipótese (mesma lógica
 * do criador-lp) em vez de derrubar o pipeline.
 */
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const ADS_DIR = resolve(FIXTURES_DIR, 'ads');
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

export interface GerarAdsInput {
  lp_id: string;
  cta: string;
  /** Usado quando `lp_id` é de LP gerada por LLM (ex.: lp-leandro-…). */
  vertical?: string;
  hipotese?: string;
}

export interface GerarAdsOutput {
  lp_id: string;
  qtd_ads: number;
  html: string;
  /** ID do fixture de ads usado (útil quando houve fallback). */
  ads_source_id: string;
}

function loadIndex(): LpIndexEntry[] {
  return JSON.parse(readFileSync(LP_INDEX_PATH, 'utf-8')) as LpIndexEntry[];
}

function filtrarPorVertical(index: LpIndexEntry[], vertical?: string): LpIndexEntry[] {
  if (!vertical) return index;
  const v = vertical.toLowerCase();
  const filtered = index.filter((e) => (e.vertical ?? 'healthtech').toLowerCase() === v);
  return filtered.length > 0 ? filtered : index.filter((e) => (e.vertical ?? 'healthtech') === 'healthtech');
}

function pickEntry(index: LpIndexEntry[], hipotese: string, lpIdHint?: string): LpIndexEntry {
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
  return scored[0]?.score > 0 ? scored[0].entry : index[0];
}

function resolverEntry(input: GerarAdsInput): LpIndexEntry {
  const index = loadIndex();
  const direct = index.find((e) => e.id === input.lp_id);
  if (direct) return direct;

  const pool = filtrarPorVertical(index, input.vertical);
  const chosen = pickEntry(pool, input.hipotese ?? input.lp_id);
  console.warn(
    `[criador-ads] lp_id "${input.lp_id}" fora do índice — pareando ads de "${chosen.id}" (${input.vertical ?? 'default'}).`,
  );
  return chosen;
}

export function gerarAds(input: GerarAdsInput): GerarAdsOutput {
  const entry = resolverEntry(input);
  const adsPath = resolve(ADS_DIR, entry.arquivo_ads);
  if (!existsSync(adsPath)) throw new Error(`Ads não encontrado: ${adsPath}`);
  const raw = readFileSync(adsPath, 'utf-8');
  const html = raw.replaceAll('{{CTA}}', input.cta);
  return {
    lp_id: input.lp_id,
    qtd_ads: 3,
    html,
    ads_source_id: entry.id,
  };
}

const inputSchema = z.object({
  lp_id: z.string().describe('ID da LP (lp-1 a lp-6). O par lp↔ads é 1:1.'),
  cta: z.string().default('Começar agora'),
});

const outputSchema = z.object({
  lp_id: z.string(),
  qtd_ads: z.number(),
  html: z.string(),
});

export const criadorAdsTool = createTool({
  id: 'criador-ads',
  description:
    'Gera 3 ads (cards visuais) para a LP. Recebe lp_id e devolve HTML com 3 cards lado a lado.',
  inputSchema,
  outputSchema,
  execute: async (inputData) => gerarAds(inputData as GerarAdsInput),
});
