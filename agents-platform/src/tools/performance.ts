/**
 * Performance Analyst — agregador determinístico das respostas do swarm.
 *
 * Sem LLM: recebe array de RespostaPersona e devolve métricas + veredito.
 * Thresholds são parâmetros explícitos no início — fácil de calibrar.
 */
import type { RespostaPersona } from './miro-fish.js';

export type Veredito = 'aprovada' | 'refinar' | 'podada';

export interface MetricasPerformance {
  total_personas: number;
  respostas_validas: number;
  taxa_interessados: number;
  ctr_sintetico: number;
  taxa_pagaria: number;
  intencao_media: number;
  sean_ellis_proxy: number;
  veredito: Veredito;
  motivo_veredito: string;
}

// Thresholds — calibrados pra demo (mais permissivos que em produção)
const THRESHOLDS = {
  aprovar_min_taxa_pagaria: 0.3,
  aprovar_min_intencao_media: 6,
  refinar_min_taxa_pagaria: 0.15,
  sean_ellis_intencao_minima: 8,
};

export function analisarPerformance(respostas: RespostaPersona[]): MetricasPerformance {
  const validas = respostas.filter((r) => !r.erro);
  const total = validas.length;
  if (total === 0) {
    return {
      total_personas: respostas.length,
      respostas_validas: 0,
      taxa_interessados: 0,
      ctr_sintetico: 0,
      taxa_pagaria: 0,
      intencao_media: 0,
      sean_ellis_proxy: 0,
      veredito: 'podada',
      motivo_veredito: 'Swarm sem respostas válidas — nó podado por falha técnica.',
    };
  }

  const interessados = validas.filter((r) => r.achei_interessante).length;
  const cliques = validas.filter((r) => r.clicaria_no_cta).length;
  const pagariam = validas.filter((r) => r.pagaria).length;
  const seanEllis = validas.filter((r) => r.intencao_compra_0_a_10 >= THRESHOLDS.sean_ellis_intencao_minima)
    .length;
  const intencaoMedia =
    validas.reduce((acc, r) => acc + r.intencao_compra_0_a_10, 0) / total;

  const taxaInteressados = interessados / total;
  const ctrSintetico = cliques / total;
  const taxaPagaria = pagariam / total;
  const seanEllisProxy = seanEllis / total;

  let veredito: Veredito;
  let motivo: string;
  if (
    taxaPagaria >= THRESHOLDS.aprovar_min_taxa_pagaria &&
    intencaoMedia >= THRESHOLDS.aprovar_min_intencao_media
  ) {
    veredito = 'aprovada';
    motivo = `${(taxaPagaria * 100).toFixed(0)}% pagariam e intenção média ${intencaoMedia.toFixed(1)}/10 ultrapassam os thresholds.`;
  } else if (taxaPagaria >= THRESHOLDS.refinar_min_taxa_pagaria) {
    veredito = 'refinar';
    motivo = `${(taxaPagaria * 100).toFixed(0)}% pagariam — abaixo do corte de aprovação, mas suficiente para refinar a oferta.`;
  } else {
    veredito = 'podada';
    motivo = `${(taxaPagaria * 100).toFixed(0)}% pagariam e intenção média ${intencaoMedia.toFixed(1)}/10 — sinal fraco demais; podar.`;
  }

  return {
    total_personas: respostas.length,
    respostas_validas: total,
    taxa_interessados: taxaInteressados,
    ctr_sintetico: ctrSintetico,
    taxa_pagaria: taxaPagaria,
    intencao_media: intencaoMedia,
    sean_ellis_proxy: seanEllisProxy,
    veredito,
    motivo_veredito: motivo,
  };
}
