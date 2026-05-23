/**
 * Tipos compartilhados do pipeline Beyond Agents.
 *
 * Contrato entre Orquestrador, Validador, Buscador, Criadores, Swarm e Performance.
 */
import type { RespostaPersona } from '../tools/miro-fish.js';
import type { MetricasPerformance, Veredito } from '../tools/performance.js';

/** Formulário Aurora — shape compatível com schemas/input-schema.json. */
export interface SubmissaoAurora {
  founders: Array<{
    nome: string;
    email: string;
    telefone?: string;
    genero?: string;
    data_nascimento?: string;
    cidade?: string;
    redes_sociais?: string;
    educacao?: string;
    historico_trabalho?: string;
    linkedin?: string;
    conquistas?: string;
  }>;
  solucao: {
    nome: string;
    descricao_50_chars: string;
    por_que_escolheu: string;
    vertical: 'legaltech' | 'edtech' | 'healthtech' | 'govtech' | 'outra';
    pitch_deck_url?: string;
    video_demo_url?: string;
  };
  progresso: {
    tempo_de_trabalho: string;
    cash_balance_e_burn_rate: string;
    projecao_faturamento: string;
    stack_tecnologico: string;
    reduz_custos_com_infra_beyond: boolean;
    mvp_em_4_semanas: string;
  };
  problema_mercado: {
    por_que_essa_ideia: string;
    dor_latente_e_evidencias: string;
    publico_problema_solucao: string;
    diferencial_moat: string;
    concorrentes_e_lacunas: string;
    tam_sam_som: string;
    escalabilidade_sem_custo_proporcional: string;
    canais_de_venda: string;
    barreira_legal_imediata: boolean;
  };
  expectativas: {
    convencimento: string;
    areas_de_ajuda: string;
  };
}

export interface DossieBuscador {
  concorrentes_validados: string[];
  concorrentes_omitidos_pelo_founder: string[];
  tam_sam_som_validado: string;
  dores_confirmadas: string[];
  tendencias: string[];
  auto_research_juridico?: string;
}

export interface OutputValidador {
  score_parcial_fit: number;
  veto: boolean;
  criterios: Array<{
    id: string;
    nota: number;
    peso_normalizado: number;
    fonte: string;
    justificativa: string;
    veto?: boolean;
  }>;
  tags: string[];
  recomendacao_playbook: 'descartar' | 'validar' | 'prioridade';
  discrepancias_founder_vs_research?: Array<{
    campo: string;
    founder: string;
    research: string;
    severidade: 'baixa' | 'media' | 'alta';
  }>;
}

export interface SubHipotese {
  titulo: string;
  publico_alvo: string;
  angulo: string;
  lp_headline_sugerida: string;
  lp_subhead_sugerida: string;
  lp_cta_sugerido: string;
}

export interface DecisaoOrquestrador {
  acao: 'expandir' | 'refinar' | 'podar' | 'promover';
  justificativa: string;
  sub_hipoteses: SubHipotese[];
  refinamento: {
    lp_headline_sugerida: string;
    lp_subhead_sugerida: string;
    lp_cta_sugerido: string;
    motivo_da_variacao: string;
  } | null;
}

export type EstadoNo =
  | 'pendente'
  | 'gerando'
  | 'deployada'
  | 'validando'
  | 'aprovada'
  | 'refinando'
  | 'podada'
  | 'promovida'
  | 'timeout';

export interface No {
  id: string;
  parent_id: string | null;
  profundidade: number;
  hipotese: SubHipotese;
  estado: EstadoNo;
  refinamentos_feitos: number;
  validador?: OutputValidador;
  dossie?: DossieBuscador;
  lp?: {
    lp_id: string;
    angulo: string;
    publico: string;
    html: string;
    preview_url: string;
  };
  ads?: {
    lp_id: string;
    qtd_ads: number;
    html: string;
  };
  swarm?: {
    respostas: RespostaPersona[];
    erros: number;
  };
  performance?: MetricasPerformance;
  decisao?: DecisaoOrquestrador;
  veredito_swarm?: Veredito;
  score_final?: number;
  criado_em: string;
  finalizado_em?: string;
  erro?: string;
}

export type EventoPipeline =
  | { tipo: 'no_criado'; no: No }
  | { tipo: 'estado_mudou'; no_id: string; estado: EstadoNo }
  | {
      tipo: 'validador_pronto';
      no_id: string;
      score: number;
      recomendacao: string;
      veto: boolean;
      detalhes?: OutputValidador;
    }
  | { tipo: 'buscador_pronto'; no_id: string }
  | { tipo: 'lp_pronta'; no_id: string; lp_id: string; angulo: string; publico: string; html: string; preview_url: string }
  | { tipo: 'ads_prontos'; no_id: string; qtd: number; html: string }
  | {
      tipo: 'trafego_disparado';
      no_id: string;
      lp_id: string;
      qtd_personas_target: number;
      campanha_id: string;
    }
  | {
      tipo: 'persona_respondeu';
      no_id: string;
      persona_nome: string;
      ocupacao: string;
      intencao: number;
      pagaria: boolean;
      feedback: string;
      done: number;
      total: number;
      erro?: string;
    }
  | { tipo: 'performance_pronta'; no_id: string; metricas: MetricasPerformance }
  | { tipo: 'orquestrador_decidiu'; no_id: string; decisao: DecisaoOrquestrador }
  | { tipo: 'no_finalizado'; no: No }
  | { tipo: 'cap_atingido'; cap: string; valor: number }
  | {
      tipo: 'pipeline_finalizado';
      ranking: Array<{ no_id: string; score_final: number }>;
      custo_total: { calls: number; input_tokens: number; output_tokens: number; cost_usd: number };
      custo_por_agente: Record<
        string,
        { calls: number; input_tokens: number; output_tokens: number; cost_usd: number }
      >;
      duracao_ms: number;
    };

export type Listener = (evento: EventoPipeline) => void;

export interface CapsPalco {
  MAX_DEPTH: number;
  MAX_FAN_OUT: number;
  MAX_NODES: number;
  MAX_REFINEMENTS_POR_NO: number;
  PERSONAS_POR_LP: number;
  TIMEOUT_POR_NO_MS: number;
}

export const CAPS_DEFAULT: CapsPalco = {
  MAX_DEPTH: 2,
  MAX_FAN_OUT: 2,
  MAX_NODES: 6,
  MAX_REFINEMENTS_POR_NO: 1,
  PERSONAS_POR_LP: 8,
  TIMEOUT_POR_NO_MS: 90_000,
};
