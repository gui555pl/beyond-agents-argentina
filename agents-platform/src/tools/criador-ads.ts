/**
 * Criador de Ads — tool determinística (mock).
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
}

export interface GerarAdsInput {
  lp_id: string;
  cta: string;
}

export interface GerarAdsOutput {
  lp_id: string;
  qtd_ads: number;
  html: string;
}

export function gerarAds(input: GerarAdsInput): GerarAdsOutput {
  const index = JSON.parse(readFileSync(LP_INDEX_PATH, 'utf-8')) as LpIndexEntry[];
  const entry = index.find((e) => e.id === input.lp_id);
  if (!entry) throw new Error(`lp_id "${input.lp_id}" não existe no índice.`);
  const adsPath = resolve(ADS_DIR, entry.arquivo_ads);
  if (!existsSync(adsPath)) throw new Error(`Ads não encontrado: ${adsPath}`);
  const raw = readFileSync(adsPath, 'utf-8');
  const html = raw.replaceAll('{{CTA}}', input.cta);
  return { lp_id: input.lp_id, qtd_ads: 3, html };
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
