/**
 * Pipeline de um nó da árvore — "espinha" fiel à arquitetura
 * (Arquitetura - Autovalidador de Ideias §5, com Gestor de Tráfego restaurado).
 *
 * Ordem dos 7 agentes (o Orquestrador é supervisor, não entra na espinha):
 *   1. Buscador / Benchmark  — agente nº 3 do inventário. Determinístico.
 *                              Dossiê pré-fabricado por vertical (zero token).
 *   2. Validador Aurora      — agente nº 2. LLM Haiku. Aplica o scorecard de
 *                              16 critérios e pode disparar VETO regulatório
 *                              (poda antecipada, sem rodar 3-7).
 *   3. Criador de LP         — skill do agente nº 4 (Criador de Assets).
 *                              Hoje é mock determinístico (fixture HTML).
 *   4. Criador de Ads        — outra skill do mesmo Criador de Assets. Mock.
 *   5. Gestor de Tráfego     — agente nº 5. Determinístico, zero token.
 *                              Faz o handoff visual LP-deployada → Swarm.
 *   6. Swarm                 — agente nº 6 ("Miro Fish" no inventário).
 *                              LLM Haiku, N personas em paralelo (não
 *                              determinístico, feedback dinâmico).
 *   7. Análise de Performance — agente nº 7. Determinística, thresholds.
 *                              Devolve veredito ao Orquestrador.
 *
 * O Orquestrador (agente nº 1) supervisiona toda a execução e decide
 * expandir / refinar / podar / promover ao fim de cada nó — ver
 * `workflows/orquestrador.ts` e `workflows/explorar-arvore.ts`.
 *
 * Buscador e Validador podem ser forçados a determinístico via
 * `DEMO_FAST_VALIDATION=true` (default: false). Hoje, mesmo no default, o
 * Buscador já é determinístico para economizar tokens (era ~5k/run).
 *
 * Cada etapa emite eventos no listener — alimentam o stream do CLI/UI.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { callAgent, extractJson } from '../lib/anthropic-client.js';
import { gerarLp } from '../tools/criador-lp.js';
import { gerarAds } from '../tools/criador-ads.js';
import { runSwarm, type Persona } from '../tools/miro-fish.js';
import { analisarPerformance } from '../tools/performance.js';
import type {
  CapsPalco,
  DossieBuscador,
  EventoPipeline,
  Listener,
  No,
  OutputValidador,
  SubmissaoAurora,
} from '../lib/tipos.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = resolve(HERE, '..', 'agents');
const FIXTURES_DIR = resolve(HERE, '..', 'fixtures');

function loadAgentPrompt(nome: string): string {
  const raw = readFileSync(resolve(AGENTS_DIR, nome, 'prompt.md'), 'utf-8');
  // Mesma convenção do auto-loader Mastra: tudo abaixo do primeiro --- é o prompt real
  const idx = raw.split('\n').findIndex((l) => l.trim() === '---');
  return idx === -1 ? raw.trim() : raw.split('\n').slice(idx + 1).join('\n').trim();
}

const PROMPT_VALIDADOR = loadAgentPrompt('validador-aurora');
const PERSONAS_POOL: Persona[] = JSON.parse(
  readFileSync(resolve(FIXTURES_DIR, 'personas.json'), 'utf-8'),
);
/**
 * Fallback determinístico opcional para Buscador + Validador.
 *
 * Por padrão, o pipeline usa Claude em ambos. Setar `DEMO_FAST_VALIDATION=true`
 * substitui pelas versões determinísticas — útil só como rede de segurança
 * em pitch ao vivo, quando latência ou rate limit podem matar a demo.
 *
 * Em produção / dia-a-dia, mantenha desligado.
 */
const DEMO_FAST_VALIDATION = process.env.DEMO_FAST_VALIDATION === 'true';

export interface RodarPipelineNoParams {
  no: No;
  submissao: SubmissaoAurora;
  dossie_compartilhado: DossieBuscador | null;
  caps: CapsPalco;
  emit: Listener;
}

export interface RodarPipelineNoResultado {
  no: No;
  dossie_para_compartilhar: DossieBuscador | null;
}

async function rodarValidador(
  submissao: SubmissaoAurora,
  hipoteseTitulo: string,
  dossie: DossieBuscador,
): Promise<OutputValidador> {
  const input = {
    submissao_aurora: submissao,
    hipotese_no_no: hipoteseTitulo,
    dossie_buscador: dossie,
  };
  const user = `Avalie a hipótese abaixo conforme seu system prompt. Devolva APENAS o JSON do output schema.\n\n${JSON.stringify(input, null, 2)}`;
  const raw = await callAgent({
    agente: 'validador-aurora',
    system: PROMPT_VALIDADOR,
    user,
    max_tokens: 4096,
    temperature: 0.2,
    timeout_ms: 60_000,
  });
  return extractJson<OutputValidador>(raw);
}

/**
 * Buscador determinístico — não chama LLM para economizar tokens.
 *
 * Como o pipeline já usa LPs/Ads mockados (fixtures), faz sentido manter o
 * Buscador igualmente determinístico — o dossiê serve só para alimentar o
 * Validador e a UI; numa demo a confirmação automatizada de concorrentes
 * agrega pouco frente ao custo de tokens.
 *
 * Mantemos um delay artificial para o usuário "ver" o agente rodando.
 */
async function rodarBuscador(submissao: SubmissaoAurora): Promise<DossieBuscador> {
  await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 600));
  return gerarDossieDeterministico(submissao);
}

/**
 * Dossiê pré-fabricado por vertical — alimenta o Validador determinístico e a UI.
 *
 * Foi calibrado a partir de execuções reais do Buscador LLM em HealthTech /
 * EdTech / LegalTech / GovTech, mantendo apenas o conteúdo essencial para a
 * demo. Atualizar manualmente quando trocar o fixture-raiz.
 */
const DOSSIES_POR_VERTICAL: Record<string, DossieBuscador> = {
  healthtech: {
    concorrentes_validados: [
      'Doctoralia — marketplace de agendamento, não cobre gestão completa',
      'iClinic — gestão clínica sem IA generativa nativa (vendida para Afya em 2021)',
      'Memed — foco em prescrição digital, gestão limitada',
    ],
    concorrentes_omitidos_pelo_founder: [
      'Feegow — gestão mid-market R$ 400-1.200/mês, concorrente direto',
      'Amplimed — multi-unidades R$ 800-2.500/mês, overlap de público',
      'Hospital Care versão lite — lançada 2024 para clínicas pequenas',
      'Conexa B2B módulo gestão — lançado 2025, overlap com rede da founder',
    ],
    tam_sam_som_validado:
      'TAM R$ 28-32Bi (saúde digital BR). SAM R$ 1.8-2.3Bi (160k-195k clínicas 1-10 médicos). SOM R$ 250M em 3 anos é defensável com 2% penetração.',
    dores_confirmadas: [
      'No-show 22-35% — confirmado por estudos SBMFC, SBC, AMB',
      'Secretárias gastam 60-70% do tempo em WhatsApp manual (iClinic 2024)',
      '84% das clínicas pequenas sem prontuário eletrônico estruturado (CFM 2024)',
      'Sistemas enterprise R$ 4k+/mês — barreira real para clínicas pequenas',
      'Glosas evitáveis representam 8-12% do faturamento',
    ],
    tendencias: [
      'Resolução CFM 2.314/2022 consolida triagem assistida com médico no loop',
      'Open Health ANS força interoperabilidade clínicas-operadoras',
      'WhatsApp Business API virou canal default em 2024',
      'Crescimento 38% YoY em gestão clínica + IA (2024-2025)',
      'Penetração de IA generativa em clínicas pequenas ainda <8% em 2025',
    ],
    auto_research_juridico:
      'Setor regulado por CFM/ANVISA/ANS, mas SaaS de gestão NÃO exige licença específica se não fizer diagnóstico autônomo. Triagem assistida com médico no loop tem precedente (Conexa, Memed, iClinic). Risco remanescente é LGPD em saúde — mitigável com compliance, não é barreira de entrada.',
  },
  edtech: {
    concorrentes_validados: ['Descomplica', 'Geekie One', 'Sas Educação'],
    concorrentes_omitidos_pelo_founder: ['Layers', 'Lyceum', 'Edify'],
    tam_sam_som_validado:
      'TAM R$ 15Bi (EdTech BR). SAM R$ 800M-1.2Bi para nichos de aprendizagem assistida por IA.',
    dores_confirmadas: [
      'Alta evasão em cursos online',
      'Dificuldade de personalização de trilhas',
      'Tempo do professor consumido por correção manual',
    ],
    tendencias: [
      'BNCC e PNE pressionam por adaptive learning',
      'IA generativa para tutoria explodiu em 2024',
    ],
    auto_research_juridico:
      'LGPD aplicada a dados de menores requer compliance, sem barreira impeditiva.',
  },
};

function gerarDossieDeterministico(submissao: SubmissaoAurora): DossieBuscador {
  const vertical = submissao.solucao.vertical;
  const dossieEspecifico = DOSSIES_POR_VERTICAL[vertical];
  if (dossieEspecifico) return dossieEspecifico;

  // Fallback genérico — quando a vertical não tem dossiê dedicado.
  return {
    concorrentes_validados: ['Concorrentes diretos do segmento mapeados pelo Buscador.'],
    concorrentes_omitidos_pelo_founder: [
      'Concorrentes adjacentes não citados no formulário.',
    ],
    tam_sam_som_validado:
      submissao.problema_mercado.tam_sam_som ||
      'SAM relevante para o público-alvo; SOM inicial viável via canal fundador.',
    dores_confirmadas: [
      submissao.problema_mercado.dor_latente_e_evidencias.slice(0, 180),
    ],
    tendencias: [
      'Adoção crescente de canais digitais no segmento',
      'Pressão por eficiência operacional pós-COVID',
      'Penetração de IA generativa ainda baixa no público-alvo',
    ],
    auto_research_juridico:
      'Sem bloqueio regulatório imediato para o modelo proposto na vertical declarada.',
  };
}

function gerarValidadorDeterministico(
  submissao: SubmissaoAurora,
  hipoteseTitulo: string,
): OutputValidador {
  const riscoLegal = submissao.problema_mercado.barreira_legal_imediata;
  const scoreBase = submissao.solucao.vertical === 'healthtech' ? 74 : 66;
  const score = Math.max(45, Math.min(92, scoreBase - (riscoLegal ? 25 : 0)));
  return {
    score_parcial_fit: score,
    veto: !!riscoLegal,
    criterios: [
      {
        id: 'alinhamento_tese',
        nota: submissao.solucao.vertical === 'healthtech' ? 9 : 7,
        peso_normalizado: 12,
        fonte: 'submissao.solucao.vertical',
        justificativa: `Hipótese "${hipoteseTitulo}" alinhada ao foco de validação da demo.`,
        veto: false,
      },
      {
        id: 'problema_real',
        nota: 8,
        peso_normalizado: 14,
        fonte: 'submissao.problema_mercado.dor_latente_e_evidencias',
        justificativa: 'Dor descrita é recorrente e possui evidência qualitativa no formulário.',
        veto: false,
      },
      {
        id: 'risco_regulatorio',
        nota: riscoLegal ? 2 : 7,
        peso_normalizado: 10,
        fonte: 'submissao.problema_mercado.barreira_legal_imediata',
        justificativa: riscoLegal
          ? 'Founder marcou barreira legal imediata: veto de segurança em modo demo.'
          : 'Sem barreira legal imediata sinalizada pelo founder.',
        veto: !!riscoLegal,
      },
    ],
    tags: ['demo-fast-mode', `vertical-${submissao.solucao.vertical}`],
    recomendacao_playbook: riscoLegal ? 'descartar' : score >= 70 ? 'validar' : 'prioridade',
    discrepancias_founder_vs_research: [],
  };
}

function selecionarPersonas(qtd: number): Persona[] {
  if (qtd >= PERSONAS_POOL.length) return PERSONAS_POOL;
  // Amostra estável: pega as primeiras qtd — diversidade já balanceada no fixture
  return PERSONAS_POOL.slice(0, qtd);
}

/**
 * Gestor de Tráfego — handoff visual entre LP/Ads e Swarm.
 *
 * Agente nº 5 da arquitetura (Arquitetura - Autovalidador de Ideias §3).
 * Em produção, dispara campanhas reais no Meta Ads / Google. Na demo é
 * determinístico (zero token): valida que a LP está "deployada", aceita o
 * pacote de Ads e devolve um `campanha_id` que será o identificador do
 * swarm contra essa LP.
 *
 * O delay de ~600ms simula o tempo de propagação que existiria em produção
 * (build da campanha, aprovação, etc.).
 */
async function rodarGestorTrafego(
  lpId: string,
  qtdPersonas: number,
): Promise<{ campanha_id: string; qtd_personas_target: number }> {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 250));
  return {
    campanha_id: `demo-${lpId}`,
    qtd_personas_target: qtdPersonas,
  };
}

/**
 * Snapshot leve para evento `no_finalizado`.
 *
 * Evita enviar payload gigantesco via SSE (HTML da LP + ads + todas respostas do swarm),
 * o que degrada UI e aumenta chance de engasgo no browser. A UI já recebe LP/Ads/Swarm
 * incrementalmente pelos eventos dedicados.
 */
function snapshotNoParaUi(no: No): No {
  return {
    ...no,
    lp: no.lp ? { ...no.lp, html: '' } : undefined,
    ads: no.ads ? { ...no.ads, html: '' } : undefined,
    // Mantemos só um resumo do swarm no snapshot final; feed completo já veio em tempo real.
    swarm: no.swarm
      ? {
          respostas: no.swarm.respostas.slice(-3),
          erros: no.swarm.erros,
        }
      : undefined,
  };
}

export async function rodarPipelineNo({
  no,
  submissao,
  dossie_compartilhado,
  caps,
  emit,
}: RodarPipelineNoParams): Promise<RodarPipelineNoResultado> {
  emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'validando' });
  no.estado = 'validando';

  // 1. Buscador / Benchmark (determinístico — dossiê por vertical).
  // Roda só na raiz; nós filhos herdam o dossiê via `dossie_compartilhado`.
  let dossie = dossie_compartilhado;
  if (!dossie) {
    dossie = DEMO_FAST_VALIDATION
      ? gerarDossieDeterministico(submissao)
      : await rodarBuscador(submissao);
    emit({ tipo: 'buscador_pronto', no_id: no.id });
  }
  no.dossie = dossie;

  // 2. Validador Aurora — replica a análise do Comitê Aurora sobre os 16
  // critérios. VETO regulatório aqui poda imediatamente, sem 3-7.
  const validador = DEMO_FAST_VALIDATION
    ? gerarValidadorDeterministico(submissao, no.hipotese.titulo)
    : await rodarValidador(submissao, no.hipotese.titulo, dossie);
  no.validador = validador;
  emit({
    tipo: 'validador_pronto',
    no_id: no.id,
    score: validador.score_parcial_fit,
    recomendacao: validador.recomendacao_playbook,
    veto: validador.veto,
    detalhes: validador,
  });

  // VETO regulatório: poda imediata, não gera LP/Ads/Swarm
  if (validador.veto) {
    no.estado = 'podada';
    no.finalizado_em = new Date().toISOString();
    emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'podada' });
    emit({ tipo: 'no_finalizado', no: snapshotNoParaUi(no) });
    return { no, dossie_para_compartilhar: dossie };
  }

  // 3. Criador de LP (agente nº 4 da arquitetura — "Criador de Assets")
  emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'gerando' });
  no.estado = 'gerando';
  const lpRes = gerarLp({
    hipotese: `${no.hipotese.titulo} — ${no.hipotese.publico_alvo} — ${no.hipotese.angulo}`,
    headline: no.hipotese.lp_headline_sugerida,
    subhead: no.hipotese.lp_subhead_sugerida,
    cta: no.hipotese.lp_cta_sugerido,
  });
  no.lp = lpRes;
  emit({
    tipo: 'lp_pronta',
    no_id: no.id,
    lp_id: lpRes.lp_id,
    angulo: lpRes.angulo,
    publico: lpRes.publico,
    html: lpRes.html,
    preview_url: lpRes.preview_url,
  });

  // 4. Criador de Ads (skill do mesmo Criador de Assets — 3 variações)
  const adsRes = gerarAds({ lp_id: lpRes.lp_id, cta: no.hipotese.lp_cta_sugerido });
  no.ads = adsRes;
  emit({ tipo: 'ads_prontos', no_id: no.id, qtd: adsRes.qtd_ads, html: adsRes.html });

  // 5. Deploy simulado — LP "deployada", agora vai para o tráfego.
  emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'deployada' });
  no.estado = 'deployada';

  // 6. Gestor de Tráfego (agente nº 5 da arquitetura) — handoff visual da
  // LP deployada para o swarm. Determinístico, zero token.
  const trafego = await rodarGestorTrafego(lpRes.lp_id, caps.PERSONAS_POR_LP);
  emit({
    tipo: 'trafego_disparado',
    no_id: no.id,
    lp_id: lpRes.lp_id,
    qtd_personas_target: trafego.qtd_personas_target,
    campanha_id: trafego.campanha_id,
  });

  // 7. Swarm (agente nº 6 — "Miro Fish") — N personas LLM em paralelo
  const personas = selecionarPersonas(caps.PERSONAS_POR_LP);
  const swarm = await runSwarm({
    lp_id: lpRes.lp_id,
    lp_html: lpRes.html,
    personas,
    contexto_extra: `Hipótese sendo testada: ${no.hipotese.titulo} (${no.hipotese.publico_alvo})`,
    onProgress: (resposta, done, total) => {
      emit({
        tipo: 'persona_respondeu',
        no_id: no.id,
        persona_nome: resposta.nome,
        ocupacao: resposta.ocupacao,
        intencao: resposta.intencao_compra_0_a_10,
        pagaria: resposta.pagaria,
        feedback: resposta.feedback_qualitativo,
        done,
        total,
        erro: resposta.erro,
      });
    },
  });
  no.swarm = { respostas: swarm.respostas, erros: swarm.erros };

  // 8. Análise de Performance (agente nº 7 — determinística)
  const performance = analisarPerformance(swarm.respostas);
  no.performance = performance;
  no.veredito_swarm = performance.veredito;
  emit({ tipo: 'performance_pronta', no_id: no.id, metricas: performance });

  no.finalizado_em = new Date().toISOString();
  emit({ tipo: 'no_finalizado', no: snapshotNoParaUi(no) });
  return { no, dossie_para_compartilhar: dossie };
}
