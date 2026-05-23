/**
 * Store global da UI — Zustand.
 *
 * Mantém estado da run ATIVA na aba atual. Cada aba/usuário tem sua run;
 * o backend é multi-tenant (até 3 runs paralelas). Quando o usuário navega
 * para outra `/runs/:runId`, chamamos `hidratar(runId, ...)` que zera a
 * store e abre o SSE para a nova run.
 */
import { create } from 'zustand';
import type {
  ConnectionStatus,
  EventoPipeline,
  No,
  RespostaPersona,
  RunStatus,
  SubmissaoAurora,
} from './tipos';

export type Fase = 'home' | 'live' | 'fim';

interface CustoBlock {
  calls: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
}

export interface StoreState {
  fase: Fase;
  runId: string | null;
  submissionId: string | null;
  nomeSolucao: string | null;
  status: RunStatus | null;
  queuePosition: number;
  submissao: SubmissaoAurora | null;
  hipoteseRaiz: string | null;
  nos: Record<string, No>;
  ordemCriacao: string[];
  eventos: EventoPipeline[];
  selecionadoId: string | null;
  ranking: Array<{ no_id: string; score_final: number }>;
  custoTotal: CustoBlock | null;
  custoPorAgente: Record<string, CustoBlock> | null;
  duracaoMs: number | null;
  erro: string | null;
  connectionStatus: ConnectionStatus;
  // ações
  setFase: (f: Fase) => void;
  iniciarRun: (
    runId: string,
    submissao: SubmissaoAurora,
    hipoteseRaiz: string,
    extra?: { submissionId?: string; nomeSolucao?: string },
  ) => void;
  hidratarRun: (info: {
    runId: string;
    submissionId: string;
    nomeSolucao: string | null;
    status: RunStatus;
    queuePosition: number;
    submissao: SubmissaoAurora;
    hipoteseRaiz: string;
  }) => void;
  setStatus: (status: RunStatus, queuePosition?: number) => void;
  aplicarEvento: (e: EventoPipeline) => void;
  selecionar: (id: string | null) => void;
  reset: () => void;
  setErro: (msg: string | null) => void;
  setConnection: (status: ConnectionStatus) => void;
}

const ESTADO_INICIAL: Omit<
  StoreState,
  'setFase' | 'iniciarRun' | 'hidratarRun' | 'setStatus' | 'aplicarEvento' | 'selecionar' | 'reset' | 'setErro' | 'setConnection'
> = {
  fase: 'home',
  runId: null,
  submissionId: null,
  nomeSolucao: null,
  status: null,
  queuePosition: 0,
  submissao: null,
  hipoteseRaiz: null,
  nos: {},
  ordemCriacao: [],
  eventos: [],
  selecionadoId: null,
  ranking: [],
  custoTotal: null,
  custoPorAgente: null,
  duracaoMs: null,
  erro: null,
  connectionStatus: 'idle',
};

export const useStore = create<StoreState>((set, get) => ({
  ...ESTADO_INICIAL,

  setFase: (fase) => set({ fase }),
  setErro: (erro) => set({ erro }),
  setConnection: (connectionStatus) => set({ connectionStatus }),

  iniciarRun: (runId, submissao, hipoteseRaiz, extra) =>
    set({
      ...ESTADO_INICIAL,
      runId,
      submissionId: extra?.submissionId ?? null,
      nomeSolucao: extra?.nomeSolucao ?? submissao.solucao.nome ?? null,
      submissao,
      hipoteseRaiz,
      status: 'starting',
      fase: 'live',
    }),

  hidratarRun: (info) =>
    set({
      ...ESTADO_INICIAL,
      runId: info.runId,
      submissionId: info.submissionId,
      nomeSolucao: info.nomeSolucao ?? info.submissao.solucao.nome ?? null,
      status: info.status,
      queuePosition: info.queuePosition,
      submissao: info.submissao,
      hipoteseRaiz: info.hipoteseRaiz,
      fase: info.status === 'done' || info.status === 'failed' || info.status === 'canceled'
        ? 'fim'
        : 'live',
    }),

  setStatus: (status, queuePosition) =>
    set({ status, queuePosition: queuePosition ?? get().queuePosition }),

  reset: () => set({ ...ESTADO_INICIAL }),

  selecionar: (id) => set({ selecionadoId: id }),

  aplicarEvento: (evento) => {
    const state = get();
    const eventos = state.eventos.length >= 200
      ? [...state.eventos.slice(-199), evento]
      : [...state.eventos, evento];

    switch (evento.tipo) {
      case 'no_criado': {
        const no: No = { ...evento.no };
        const ordem = state.ordemCriacao.includes(no.id)
          ? state.ordemCriacao
          : [...state.ordemCriacao, no.id];
        // Auto-seleciona o primeiro nó
        const selecionadoId = state.selecionadoId ?? no.id;
        // Primeiro evento de qualquer run promove o status pra 'running'
        const status: RunStatus =
          state.status === 'queued' || state.status === 'starting' || state.status === null
            ? 'running'
            : state.status;
        set({
          nos: { ...state.nos, [no.id]: no },
          ordemCriacao: ordem,
          selecionadoId,
          eventos,
          status,
        });
        break;
      }

      case 'estado_mudou': {
        const atual = state.nos[evento.no_id];
        if (!atual) {
          set({ eventos });
          break;
        }
        set({
          nos: { ...state.nos, [evento.no_id]: { ...atual, estado: evento.estado } },
          eventos,
        });
        break;
      }

      case 'validador_pronto': {
        const atual = state.nos[evento.no_id];
        if (!atual) {
          set({ eventos });
          break;
        }
        // Se backend já trouxe detalhes completos, usamos eles; caso contrário, fallback parcial.
        const validadorParcial = evento.detalhes ?? atual.validador ?? {
          score_parcial_fit: evento.score,
          veto: evento.veto,
          criterios: [],
          tags: [],
          recomendacao_playbook: evento.recomendacao as
            | 'descartar'
            | 'validar'
            | 'prioridade',
          discrepancias_founder_vs_research: [],
        };
        // Se já existia, preserva e atualiza score/recomendação; senão usa parcial.
        const validador = atual.validador
          ? {
              ...atual.validador,
              ...evento.detalhes,
              score_parcial_fit: evento.score,
              veto: evento.veto,
              recomendacao_playbook: evento.recomendacao as
                | 'descartar'
                | 'validar'
                | 'prioridade',
            }
          : validadorParcial;
        set({
          nos: { ...state.nos, [evento.no_id]: { ...atual, validador } },
          eventos,
        });
        break;
      }

      case 'lp_pronta': {
        const atual = state.nos[evento.no_id];
        if (!atual) {
          set({ eventos });
          break;
        }
        const lp = {
          lp_id: evento.lp_id,
          angulo: evento.angulo,
          publico: evento.publico,
          html: evento.html,
          preview_url: evento.preview_url,
        };
        set({
          nos: { ...state.nos, [evento.no_id]: { ...atual, lp } },
          eventos,
        });
        break;
      }

      case 'ads_prontos': {
        const atual = state.nos[evento.no_id];
        if (!atual) {
          set({ eventos });
          break;
        }
        const ads = {
          lp_id: atual.lp?.lp_id ?? 'desconhecido',
          qtd_ads: evento.qtd,
          html: evento.html,
        };
        set({
          nos: { ...state.nos, [evento.no_id]: { ...atual, ads } },
          eventos,
        });
        break;
      }

      case 'persona_respondeu': {
        const atual = state.nos[evento.no_id];
        if (!atual) {
          set({ eventos });
          break;
        }
        const resposta: RespostaPersona = {
          persona_id: `live-${atual.swarm?.respostas.length ?? 0}`,
          nome: evento.persona_nome,
          ocupacao: evento.ocupacao,
          achei_interessante: evento.pagaria || evento.intencao >= 5,
          clicaria_no_cta: evento.pagaria || evento.intencao >= 6,
          pagaria: evento.pagaria,
          intencao_compra_0_a_10: evento.intencao,
          feedback_qualitativo: evento.feedback,
          erro: evento.erro,
        };
        const respostas = [...(atual.swarm?.respostas ?? []), resposta];
        const swarm = { respostas, erros: atual.swarm?.erros ?? 0 };
        set({
          nos: { ...state.nos, [evento.no_id]: { ...atual, swarm } },
          eventos,
        });
        break;
      }

      case 'performance_pronta': {
        const atual = state.nos[evento.no_id];
        if (!atual) {
          set({ eventos });
          break;
        }
        set({
          nos: {
            ...state.nos,
            [evento.no_id]: {
              ...atual,
              performance: evento.metricas,
              veredito_swarm: evento.metricas.veredito,
            },
          },
          eventos,
        });
        break;
      }

      case 'orquestrador_decidiu': {
        const atual = state.nos[evento.no_id];
        if (!atual) {
          set({ eventos });
          break;
        }
        set({
          nos: {
            ...state.nos,
            [evento.no_id]: { ...atual, decisao: evento.decisao },
          },
          eventos,
        });
        break;
      }

      case 'no_finalizado': {
        // Merge conservador para não sobrescrever LP/Ads/Swarm recebidos incrementalmente.
        const atual = state.nos[evento.no.id];
        const atualSwarm = atual?.swarm;
        const atualLp = atual?.lp;
        const atualAds = atual?.ads;
        const merged: No = {
          ...atual,
          ...evento.no,
          lp: atualLp ?? evento.no.lp,
          ads: atualAds ?? evento.no.ads,
          swarm: atualSwarm ?? evento.no.swarm,
        };
        set({
          nos: { ...state.nos, [evento.no.id]: merged },
          eventos,
        });
        break;
      }

      case 'pipeline_finalizado': {
        set({
          ranking: evento.ranking,
          custoTotal: evento.custo_total,
          custoPorAgente: evento.custo_por_agente,
          duracaoMs: evento.duracao_ms,
          fase: 'fim',
          status: 'done',
          eventos,
        });
        break;
      }

      case 'cap_atingido':
      case 'buscador_pronto':
      case 'trafego_disparado':
        // Não muda estado; só vira event log
        set({ eventos });
        break;
    }
  },
}));
