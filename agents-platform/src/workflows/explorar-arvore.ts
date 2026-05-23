/**
 * Loop principal — explora árvore de hipóteses até estourar caps.
 *
 * Algoritmo:
 *   1. Cria nó raiz a partir do formulário (hipótese_raiz).
 *   2. Empilha raiz na fila pendente.
 *   3. Enquanto há nó pendente E caps não estouraram:
 *      a. Processa o próximo nó (rodarPipelineNo).
 *      b. Chama orquestrador com veredito + estado da árvore.
 *      c. Aplica decisão: cria filhos / cria variação / poda / promove.
 *   4. Retorna árvore + ranking final.
 *
 * Cap MAX_NODES é hard — orquestrador pode pedir mais que isso, a gente trunca.
 */
import { rodarPipelineNo, type RodarPipelineNoResultado } from './pipeline-no.js';
import { chamarOrquestrador } from './orquestrador.js';
import { getTracker } from '../lib/cost-tracker.js';
import {
  CAPS_DEFAULT,
  type CapsPalco,
  type CopyGuide,
  type DossieBuscador,
  type EventoPipeline,
  type Listener,
  type No,
  type SubHipotese,
  type SubmissaoAurora,
} from '../lib/tipos.js';

interface InputPipeline {
  submissao: SubmissaoAurora;
  hipotese_raiz: string;
  caps?: Partial<CapsPalco>;
  listener?: Listener;
  run_id?: string;
  signal?: AbortSignal;
}

interface ResultadoPipeline {
  arvore: No[];
  ranking: Array<{ no: No; score_final: number }>;
  dossie_compartilhado: DossieBuscador | null;
  copy_guide_compartilhado: CopyGuide | null;
  encerrou_por: 'caps' | 'arvore_vazia' | 'erro';
}

/**
 * Gerador de IDs sequenciais por run.
 *
 * Antes era módulo-level, então o contador vazava entre runs e a segunda
 * execução começava em "no-007" em vez de "no-001". Agora é factory por run.
 */
function criarGenId(): () => string {
  let counter = 0;
  return () => {
    counter++;
    return `no-${counter.toString().padStart(3, '0')}`;
  };
}

function noopListener(): void {}

function hipoteseRaizFromSubmissao(submissao: SubmissaoAurora, titulo: string): SubHipotese {
  return {
    titulo,
    publico_alvo: submissao.problema_mercado.publico_problema_solucao || 'Público inicial do founder',
    angulo: submissao.solucao.descricao_50_chars,
    lp_headline_sugerida: `${submissao.solucao.nome}: ${submissao.solucao.descricao_50_chars}`,
    lp_subhead_sugerida: submissao.problema_mercado.dor_latente_e_evidencias.slice(0, 220),
    lp_cta_sugerido: 'Quero testar grátis',
  };
}

/**
 * Score final multivariável (alinhado com §9 do doc de arquitetura).
 *
 * Pesos hardcoded — fácil de tunar:
 *   w1 quanti = 0.30  (taxa_pagaria + ctr_sintetico)
 *   w2 quali  = 0.25  (sean_ellis_proxy + intencao_media)
 *   w3 econ   = 0.10  (proxy negativo: penaliza nós que custaram mais — simplificado)
 *   w4 fit    = 0.35  (score Aurora normalizado 0-1)
 *
 * Devolve 0-100.
 */
function calcularScoreFinal(no: No): number {
  if (!no.performance || !no.validador) return 0;
  const p = no.performance;
  const quanti = p.taxa_pagaria * 0.6 + p.ctr_sintetico * 0.4;
  const quali = p.sean_ellis_proxy * 0.5 + (p.intencao_media / 10) * 0.5;
  const econ = 0.7; // proxy — penalização real exige custo por nó, fora do escopo do MVP
  const fit = (no.validador.score_parcial_fit ?? 0) / 100;
  const score01 = 0.3 * quanti + 0.25 * quali + 0.1 * econ + 0.35 * fit;
  return Math.round(score01 * 1000) / 10; // 0-100 com 1 casa
}

function profundidadePermiteExpansao(no: No, caps: CapsPalco): boolean {
  return no.profundidade < caps.MAX_DEPTH;
}

export async function explorarArvore({
  submissao,
  hipotese_raiz,
  caps: capsOverride,
  listener,
  run_id,
  signal,
}: InputPipeline): Promise<ResultadoPipeline> {
  const caps: CapsPalco = { ...CAPS_DEFAULT, ...(capsOverride ?? {}) };
  const emit: Listener = listener ?? noopListener;
  const arvore: No[] = [];
  const fila: No[] = [];
  const t0 = Date.now();
  const genId = criarGenId();

  // Cria raiz
  const raiz: No = {
    id: genId(),
    parent_id: null,
    profundidade: 0,
    hipotese: hipoteseRaizFromSubmissao(submissao, hipotese_raiz),
    estado: 'pendente',
    refinamentos_feitos: 0,
    criado_em: new Date().toISOString(),
  };
  arvore.push(raiz);
  fila.push(raiz);
  emit({ tipo: 'no_criado', no: raiz });

  let dossie_compartilhado: DossieBuscador | null = null;
  let copy_guide_compartilhado: CopyGuide | null = null;
  let encerrou_por: ResultadoPipeline['encerrou_por'] = 'arvore_vazia';

  while (fila.length > 0) {
    if (arvore.length > caps.MAX_NODES) {
      emit({ tipo: 'cap_atingido', cap: 'MAX_NODES', valor: caps.MAX_NODES });
      encerrou_por = 'caps';
      break;
    }
    const no = fila.shift()!;

    // 1. Processa o nó (Beatriz + Validador + Leandro + Ads + Swarm + Performance)
    const nodeAbort = new AbortController();
    const signals: AbortSignal[] = [nodeAbort.signal];
    if (signal) signals.push(signal);
    const combinedSignal = AbortSignal.any(signals);
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const resultado: RodarPipelineNoResultado = await Promise.race([
        rodarPipelineNo({
          no,
          submissao,
          dossie_compartilhado,
          copy_guide_compartilhado,
          caps,
          emit,
          run_id,
          signal: combinedSignal,
        }),
        new Promise<RodarPipelineNoResultado>((_, reject) => {
          timeoutId = setTimeout(() => {
            nodeAbort.abort();
            reject(new Error('timeout'));
          }, caps.TIMEOUT_POR_NO_MS);
        }),
      ]);
      if (timeoutId) clearTimeout(timeoutId);
      if (!dossie_compartilhado && resultado.dossie_para_compartilhar) {
        dossie_compartilhado = resultado.dossie_para_compartilhar;
      }
      if (!copy_guide_compartilhado && resultado.copy_guide_para_compartilhar) {
        copy_guide_compartilhado = resultado.copy_guide_para_compartilhar;
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      const aborted =
        signal?.aborted ||
        nodeAbort.signal.aborted ||
        (err instanceof Error && err.name === 'AbortError');
      if (aborted) {
        no.estado = 'podada';
        no.erro = 'abortada';
        emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'podada' });
        encerrou_por = 'erro';
        break;
      }
      no.estado = err instanceof Error && err.message === 'timeout' ? 'timeout' : 'podada';
      no.erro = err instanceof Error ? err.message : String(err);
      console.warn(`[explorar-arvore] pipeline falhou em ${no.id}:`, no.erro);
      emit({ tipo: 'estado_mudou', no_id: no.id, estado: no.estado });
      continue; // segue para o próximo da fila
    }

    // VETO já podou? Se sim, pula o orquestrador
    if (no.estado === 'podada') continue;

    // 2. Orquestrador decide próximo passo. Se a chamada LLM falhar
    // (timeout, rate limit, JSON inválido), poda o nó e continua — assim
    // a árvore não morre inteira por causa de um nó.
    let decisao: import('../lib/tipos.js').DecisaoOrquestrador;
    try {
      decisao = await chamarOrquestrador({
        no_atual: no,
        arvore,
        caps,
        motivo_chamada: 'apos_veredito',
        run_id,
        signal,
      });
    } catch (err) {
      no.estado = 'podada';
      no.erro = `orquestrador: ${err instanceof Error ? err.message : String(err)}`;
      emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'podada' });
      continue;
    }
    // Trava defensiva: raiz NUNCA é promovida/podada sem explorar (a menos que
    // haja VETO). Garante árvore visível na demo mesmo se o LLM decidir
    // promover a raiz por sinal forte do swarm.
    const ehRaiz = no.parent_id === null;
    const podeExpandirRaiz =
      ehRaiz &&
      !no.validador?.veto &&
      no.profundidade < caps.MAX_DEPTH &&
      arvore.length + caps.MAX_FAN_OUT <= caps.MAX_NODES;
    if (podeExpandirRaiz && (decisao.acao === 'promover' || decisao.acao === 'podar')) {
      decisao = {
        acao: 'expandir',
        justificativa: `[trava] Raiz precisa explorar antes de finalizar. Decisão LLM original: ${decisao.acao} — substituída por expandir.`,
        sub_hipoteses: decisao.sub_hipoteses?.length
          ? decisao.sub_hipoteses
          : [
              {
                titulo: `${no.hipotese.titulo} — variação A`,
                publico_alvo: no.hipotese.publico_alvo,
                angulo: `${no.hipotese.angulo} (foco premium)`,
                lp_headline_sugerida: `${no.hipotese.lp_headline_sugerida} (premium)`,
                lp_subhead_sugerida: no.hipotese.lp_subhead_sugerida,
                lp_cta_sugerido: no.hipotese.lp_cta_sugerido,
              },
              {
                titulo: `${no.hipotese.titulo} — variação B`,
                publico_alvo: no.hipotese.publico_alvo,
                angulo: `${no.hipotese.angulo} (foco custo)`,
                lp_headline_sugerida: `${no.hipotese.lp_headline_sugerida} (econômico)`,
                lp_subhead_sugerida: no.hipotese.lp_subhead_sugerida,
                lp_cta_sugerido: no.hipotese.lp_cta_sugerido,
              },
            ],
        refinamento: null,
      };
    }

    no.decisao = decisao;
    emit({ tipo: 'orquestrador_decidiu', no_id: no.id, decisao });

    // 3. Aplica decisão
    switch (decisao.acao) {
      case 'podar':
        no.estado = 'podada';
        emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'podada' });
        break;

      case 'promover':
        no.estado = 'promovida';
        no.score_final = calcularScoreFinal(no);
        emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'promovida' });
        break;

      case 'refinar': {
        if (no.refinamentos_feitos >= caps.MAX_REFINEMENTS_POR_NO) {
          // Cap estourado: força promover (se aprovado) ou podar
          if (no.veredito_swarm === 'aprovada' || no.veredito_swarm === 'refinar') {
            no.estado = 'promovida';
            no.score_final = calcularScoreFinal(no);
            emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'promovida' });
          } else {
            no.estado = 'podada';
            emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'podada' });
          }
          break;
        }
        if (!decisao.refinamento) {
          // Decisão mal-formada — força promover ou podar
          no.estado =
            no.veredito_swarm === 'aprovada' ? 'promovida' : 'podada';
          if (no.estado === 'promovida') no.score_final = calcularScoreFinal(no);
          emit({ tipo: 'estado_mudou', no_id: no.id, estado: no.estado });
          break;
        }
        // Cria um nó-variação como filho (mesma profundidade conceitualmente, mas
        // facilita o tracking se for filho direto)
        if (arvore.length >= caps.MAX_NODES) {
          emit({ tipo: 'cap_atingido', cap: 'MAX_NODES', valor: caps.MAX_NODES });
          break;
        }
        const variacao: No = {
          id: genId(),
          parent_id: no.id,
          profundidade: no.profundidade,
          hipotese: {
            ...no.hipotese,
            titulo: `${no.hipotese.titulo} (variação)`,
            lp_headline_sugerida: decisao.refinamento.lp_headline_sugerida,
            lp_subhead_sugerida: decisao.refinamento.lp_subhead_sugerida,
            lp_cta_sugerido: decisao.refinamento.lp_cta_sugerido,
          },
          estado: 'pendente',
          refinamentos_feitos: 0,
          criado_em: new Date().toISOString(),
        };
        no.refinamentos_feitos += 1;
        no.estado = 'refinando';
        emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'refinando' });
        arvore.push(variacao);
        fila.push(variacao);
        emit({ tipo: 'no_criado', no: variacao });
        break;
      }

      case 'expandir': {
        no.estado = no.veredito_swarm === 'aprovada' ? 'aprovada' : 'refinando';
        emit({ tipo: 'estado_mudou', no_id: no.id, estado: no.estado });
        if (!profundidadePermiteExpansao(no, caps)) {
          // Profundidade no limite — promove
          no.estado = 'promovida';
          no.score_final = calcularScoreFinal(no);
          emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'promovida' });
          break;
        }
        const sub = decisao.sub_hipoteses.slice(0, caps.MAX_FAN_OUT);
        for (const s of sub) {
          if (arvore.length >= caps.MAX_NODES) {
            emit({ tipo: 'cap_atingido', cap: 'MAX_NODES', valor: caps.MAX_NODES });
            break;
          }
          const filho: No = {
            id: genId(),
            parent_id: no.id,
            profundidade: no.profundidade + 1,
            hipotese: s,
            estado: 'pendente',
            refinamentos_feitos: 0,
            criado_em: new Date().toISOString(),
          };
          arvore.push(filho);
          fila.push(filho);
          emit({ tipo: 'no_criado', no: filho });
        }
        break;
      }
    }
  }

  // Score final para nós promovidos e fallback para aprovados não-promovidos
  for (const no of arvore) {
    if (no.score_final == null && (no.estado === 'promovida' || no.estado === 'aprovada')) {
      no.score_final = calcularScoreFinal(no);
    }
  }

  const ranking = arvore
    .filter((n) => n.score_final != null && n.score_final > 0)
    .map((n) => ({ no: n, score_final: n.score_final! }))
    .sort((a, b) => b.score_final - a.score_final);

  const tracker = getTracker(run_id);
  emit({
    tipo: 'pipeline_finalizado',
    ranking: ranking.map((r) => ({ no_id: r.no.id, score_final: r.score_final })),
    custo_total: tracker.total(),
    custo_por_agente: tracker.byAgent(),
    duracao_ms: Date.now() - t0,
  });

  return {
    arvore,
    ranking,
    dossie_compartilhado,
    copy_guide_compartilhado,
    encerrou_por,
  };
}

export type { EventoPipeline, No, ResultadoPipeline };
