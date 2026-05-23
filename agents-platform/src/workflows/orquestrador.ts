/**
 * Chamada do Orquestrador.
 *
 * A cada nó processado, recebe veredito + estado da árvore + caps e devolve
 * decisão JSON estruturada (expandir/refinar/podar/promover).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { callAgent, extractJson } from '../lib/anthropic-client.js';
import type { CapsPalco, DecisaoOrquestrador, No } from '../lib/tipos.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = resolve(HERE, '..', 'agents');

function loadPrompt(): string {
  const raw = readFileSync(resolve(AGENTS_DIR, 'orquestrador', 'prompt.md'), 'utf-8');
  const idx = raw.split('\n').findIndex((l) => l.trim() === '---');
  return idx === -1 ? raw.trim() : raw.split('\n').slice(idx + 1).join('\n').trim();
}

const PROMPT = loadPrompt();
/**
 * Fallback determinístico opcional para o Orquestrador.
 *
 * Por padrão, decisões de expandir/refinar/podar/promover saem do Claude
 * (system prompt em `src/agents/orquestrador/prompt.md`). Setar
 * `DEMO_FAST_ORCHESTRATOR=true` ativa uma árvore de regras simples — só usar
 * como rede de segurança em demos ao vivo.
 */
const DEMO_FAST_ORCHESTRATOR = process.env.DEMO_FAST_ORCHESTRATOR === 'true';

export interface ContextoOrquestrador {
  no_atual: No;
  arvore: No[];
  caps: CapsPalco;
  motivo_chamada: 'apos_veredito' | 'criacao_raiz';
  run_id?: string;
  signal?: AbortSignal;
}

function resumirNoParaOrquestrador(no: No): Record<string, unknown> {
  return {
    id: no.id,
    parent_id: no.parent_id,
    profundidade: no.profundidade,
    estado: no.estado,
    refinamentos_feitos: no.refinamentos_feitos,
    hipotese: no.hipotese,
    score_aurora: no.validador?.score_parcial_fit ?? null,
    recomendacao_aurora: no.validador?.recomendacao_playbook ?? null,
    veto_aurora: no.validador?.veto ?? null,
    veredito_swarm: no.veredito_swarm ?? null,
    metricas: no.performance
      ? {
          taxa_pagaria: no.performance.taxa_pagaria,
          intencao_media: no.performance.intencao_media,
          sean_ellis_proxy: no.performance.sean_ellis_proxy,
          ctr_sintetico: no.performance.ctr_sintetico,
          motivo_veredito: no.performance.motivo_veredito,
        }
      : null,
  };
}

/**
 * Fallback determinístico do Orquestrador (opt-in via DEMO_FAST_ORCHESTRATOR=true).
 *
 * Aproxima o gate definido no prompt principal:
 *   - VETO regulatorio              -> podar
 *   - profundidade 0 + cabe expandir -> expandir (raiz sempre explora)
 *   - veredito 'aprovada' (prof > 0) -> promover (analogo a Aurora >= 70 + aprovada
 *                                       do principio 5 do prompt LLM)
 *   - veredito 'podada'             -> podar
 *   - veredito 'refinar' + cabe     -> expandir 2 sub-hipoteses
 *   - sem espaco para expandir      -> refinar (1 vez por no, MAX_REFINEMENTS_POR_NO)
 *   - refinamentos esgotados        -> podar
 *
 * Mantenha sincronizado com o principio 5 do prompt do Orquestrador
 * (agents-platform/src/agents/orquestrador/prompt.md).
 */
function decidirOrquestradorDeterministico(ctx: ContextoOrquestrador): DecisaoOrquestrador {
  const no = ctx.no_atual;
  if (no.validador?.veto) {
    return {
      acao: 'podar',
      justificativa: 'Veto regulatório no validador em modo demo.',
      sub_hipoteses: [],
      refinamento: null,
    };
  }

  const podeExpandir = no.profundidade < ctx.caps.MAX_DEPTH
    && ctx.arvore.length + 2 <= ctx.caps.MAX_NODES;

  // Profundidade 0 (raiz) nunca termina sem explorar — garante árvore visível
  // na demo mesmo se o swarm aprovar de cara.
  if (no.profundidade === 0 && podeExpandir) {
    return {
      acao: 'expandir',
      justificativa: 'Raiz expande por padrão para gerar árvore exploratória.',
      sub_hipoteses: [
        {
          titulo: `${no.hipotese.titulo} — foco segmento premium`,
          publico_alvo: `${no.hipotese.publico_alvo} com maior ticket médio`,
          angulo: `${no.hipotese.angulo} com ênfase em ROI`,
          lp_headline_sugerida: `${no.hipotese.lp_headline_sugerida} com ROI em 30 dias`,
          lp_subhead_sugerida: `${no.hipotese.lp_subhead_sugerida} Prova social + números financeiros.`,
          lp_cta_sugerido: 'Quero calcular meu ROI',
        },
        {
          titulo: `${no.hipotese.titulo} — foco eficiência operacional`,
          publico_alvo: `${no.hipotese.publico_alvo} com equipe administrativa enxuta`,
          angulo: `${no.hipotese.angulo} para reduzir horas operacionais`,
          lp_headline_sugerida: `${no.hipotese.lp_headline_sugerida} sem trabalho manual`,
          lp_subhead_sugerida: `${no.hipotese.lp_subhead_sugerida} Menos tarefas manuais, mais agenda cheia.`,
          lp_cta_sugerido: 'Ver demo em 2 minutos',
        },
      ],
      refinamento: null,
    };
  }

  if (no.veredito_swarm === 'aprovada') {
    return {
      acao: 'promover',
      justificativa: 'Swarm aprovou com sinal forte de compra.',
      sub_hipoteses: [],
      refinamento: null,
    };
  }

  if (no.veredito_swarm === 'podada') {
    return {
      acao: 'podar',
      justificativa: 'Swarm sinalizou baixa intenção de compra.',
      sub_hipoteses: [],
      refinamento: null,
    };
  }

  if (podeExpandir) {
    return {
      acao: 'expandir',
      justificativa: 'Veredito intermediário: explorar duas variações de hipótese.',
      sub_hipoteses: [
        {
          titulo: `${no.hipotese.titulo} — foco segmento premium`,
          publico_alvo: `${no.hipotese.publico_alvo} com maior ticket médio`,
          angulo: `${no.hipotese.angulo} com ênfase em ROI`,
          lp_headline_sugerida: `${no.hipotese.lp_headline_sugerida} com ROI em 30 dias`,
          lp_subhead_sugerida: `${no.hipotese.lp_subhead_sugerida} Prova social + números financeiros.`,
          lp_cta_sugerido: 'Quero calcular meu ROI',
        },
        {
          titulo: `${no.hipotese.titulo} — foco eficiência operacional`,
          publico_alvo: `${no.hipotese.publico_alvo} com equipe administrativa enxuta`,
          angulo: `${no.hipotese.angulo} para reduzir horas operacionais`,
          lp_headline_sugerida: `${no.hipotese.lp_headline_sugerida} sem trabalho manual`,
          lp_subhead_sugerida: `${no.hipotese.lp_subhead_sugerida} Menos tarefas manuais, mais agenda cheia.`,
          lp_cta_sugerido: 'Ver demo em 2 minutos',
        },
      ],
      refinamento: null,
    };
  }

  if (no.refinamentos_feitos < ctx.caps.MAX_REFINEMENTS_POR_NO) {
    return {
      acao: 'refinar',
      justificativa: 'Sem espaço para expandir: aplicar um refinamento de copy.',
      sub_hipoteses: [],
      refinamento: {
        lp_headline_sugerida: `${no.hipotese.lp_headline_sugerida} com prova de resultado`,
        lp_subhead_sugerida: `${no.hipotese.lp_subhead_sugerida} Inclui resultados reais de pilotos.`,
        lp_cta_sugerido: 'Quero ver resultados',
        motivo_da_variacao: 'Aumentar clareza de valor e confiança no CTA.',
      },
    };
  }

  return {
    acao: 'podar',
    justificativa: 'Cap de refinamentos atingido sem sinal suficiente de promoção.',
    sub_hipoteses: [],
    refinamento: null,
  };
}

export async function chamarOrquestrador(
  ctx: ContextoOrquestrador,
): Promise<DecisaoOrquestrador> {
  if (DEMO_FAST_ORCHESTRATOR) {
    return decidirOrquestradorDeterministico(ctx);
  }

  const arvoreResumo = ctx.arvore.map(resumirNoParaOrquestrador);
  const noAtualResumo = resumirNoParaOrquestrador(ctx.no_atual);
  const user = `# Estado da árvore (${ctx.arvore.length} nós)

\`\`\`json
${JSON.stringify(arvoreResumo, null, 2)}
\`\`\`

# Nó atual (acabou de ser processado)

\`\`\`json
${JSON.stringify(noAtualResumo, null, 2)}
\`\`\`

# Caps do palco

- MAX_DEPTH = ${ctx.caps.MAX_DEPTH}
- MAX_FAN_OUT = ${ctx.caps.MAX_FAN_OUT}
- MAX_NODES = ${ctx.caps.MAX_NODES}
- MAX_REFINEMENTS_POR_NO = ${ctx.caps.MAX_REFINEMENTS_POR_NO}

Decida a próxima ação. Devolva APENAS o JSON.`;

  const raw = await callAgent({
    agente: 'orquestrador',
    system: PROMPT,
    user,
    max_tokens: 2048,
    temperature: 0.4,
    timeout_ms: 45_000,
    run_id: ctx.run_id,
    signal: ctx.signal,
  });
  const decisao = extractJson<DecisaoOrquestrador>(raw);
  // Normaliza campos nulos
  if (decisao.acao !== 'expandir') decisao.sub_hipoteses = [];
  if (decisao.acao !== 'refinar') decisao.refinamento = null;
  // Limita fan_out conforme cap
  if (decisao.acao === 'expandir' && decisao.sub_hipoteses.length > ctx.caps.MAX_FAN_OUT) {
    decisao.sub_hipoteses = decisao.sub_hipoteses.slice(0, ctx.caps.MAX_FAN_OUT);
  }
  return decisao;
}
