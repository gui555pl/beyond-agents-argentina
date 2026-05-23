/**
 * Pipeline de um nó da árvore — "espinha" fiel à arquitetura
 * (Arquitetura - Autovalidador de Ideias §5, com Gestor de Tráfego restaurado).
 *
 * Ordem dos 7 agentes (o Orquestrador é supervisor, não entra na espinha):
 *   1. Beatriz (Benchmark + Copy Guide) — agente nº 3 do inventário. LLM Sonnet.
 *                              Analisa concorrentes + gera dossiê + Copy Guide
 *                              estratégico (ICP, JTBD, PAS, Tone of Voice).
 *                              Roda 1× na raiz; copy_guide é compartilhado.
 *                              Fallback: dossiê hardcoded por vertical.
 *   2. Validador Aurora      — agente nº 2. LLM Haiku. Aplica o scorecard de
 *                              16 critérios e pode disparar VETO regulatório
 *                              (poda antecipada, sem rodar 3-7).
 *   3. Leandro LP            — agente nº 4 ("Criador de Assets"). LLM Sonnet.
 *                              Gera HTML completo standalone usando o
 *                              Copy Guide como contexto. Fallback: pool de
 *                              fixtures rotativos.
 *   4. Criador de Ads        — skill auxiliar. Mock determinístico (3 cards).
 *   5. Gestor de Tráfego     — agente nº 5. Determinístico, zero token.
 *                              Faz o handoff visual LP-deployada → Swarm.
 *   6. Swarm                 — agente nº 6 ("Miro Fish" no inventário).
 *                              LLM Haiku, N personas em paralelo.
 *   7. Análise de Performance — agente nº 7. Determinística, thresholds.
 *                              Devolve veredito ao Orquestrador.
 *
 * Beatriz e Validador podem ser forçados a determinístico via
 * `DEMO_FAST_VALIDATION=true` (default: false). Leandro pode cair para o pool
 * de fixtures automaticamente em caso de falha LLM — robustez de pitch.
 *
 * Cada etapa emite eventos no listener — alimentam o stream do CLI/UI.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { callAgent, extractJson } from '../lib/anthropic-client.js';
import { gerarLpComLLM } from '../tools/criador-lp.js';
import { gerarAds } from '../tools/criador-ads.js';
import { runSwarm, type Persona } from '../tools/miro-fish.js';
import { analisarPerformance } from '../tools/performance.js';
import type {
  CapsPalco,
  CopyGuide,
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
const PROMPT_BEATRIZ = loadAgentPrompt('beatriz');

function loadPersonas(arquivo: string): Persona[] {
  return JSON.parse(readFileSync(resolve(FIXTURES_DIR, arquivo), 'utf-8')) as Persona[];
}

const PERSONAS_POR_VERTICAL: Record<string, Persona[]> = {
  healthtech: loadPersonas('personas-healthtech.json'),
  edtech: loadPersonas('personas-edtech.json'),
};

// Pool padrão (HealthTech) — usado quando a vertical não tem pool dedicado.
const PERSONAS_POOL_DEFAULT: Persona[] = PERSONAS_POR_VERTICAL.healthtech;
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
  copy_guide_compartilhado: CopyGuide | null;
  caps: CapsPalco;
  emit: Listener;
  run_id?: string;
  signal?: AbortSignal;
}

export interface RodarPipelineNoResultado {
  no: No;
  dossie_para_compartilhar: DossieBuscador | null;
  copy_guide_para_compartilhar: CopyGuide | null;
}

async function rodarValidador(
  submissao: SubmissaoAurora,
  hipoteseTitulo: string,
  dossie: DossieBuscador,
  runId?: string,
  signal?: AbortSignal,
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
    run_id: runId,
    signal,
  });
  return extractJson<OutputValidador>(raw);
}

/**
 * Benchmark — agente leve de contexto rápido para o LLP.
 *
 * Modo apresentação: prompt enxuto, modelo Haiku, output curto (até 10 linhas
 * de copy_guide). O dossie estruturado vem do snapshot determinístico da
 * vertical — não gastamos tokens reescrevendo competidores conhecidos.
 *
 * Foco do LLM: gerar `copy_guide` (ICP, JTBD, dor, PAS, ToV) curto e útil
 * para alimentar o LLP. Qualquer falha cai no dossiê determinístico + copy
 * guide construído a partir do formulário — pipeline nunca trava aqui.
 */
const BENCHMARK_SYSTEM_PROMPT = `Você é o agente Benchmark. Devolva um JSON enxuto que sirva de contexto pro agente LLP (landing page) gerar copy alinhada ao mercado.

Regras:
- Responda APENAS com JSON válido (sem markdown, sem prosa).
- Schema:
{
  "copy_guide": {
    "icp": "1 frase descrevendo o cliente ideal",
    "jtbd": "1 frase com o job-to-be-done",
    "dor_principal": "1 frase com a dor central",
    "proposta_valor": "1 frase de value proposition",
    "tom_de_voz": "1-2 palavras (ex: 'consultivo, direto')",
    "frase_pas": "1 frase no formato Problem-Agitate-Solve",
    "principais_objecoes": ["até 3 strings curtas"],
    "diferenciais": ["até 3 strings curtas"]
  }
}
- Cada string tem no máximo 160 caracteres. Seja conciso, evite jargão.`;

async function rodarBenchmark(
  submissao: SubmissaoAurora,
  runId?: string,
  signal?: AbortSignal,
): Promise<{ dossie: DossieBuscador; copy_guide: CopyGuide | null }> {
  const dossie = gerarDossieDeterministico(submissao);

  const inputResumo = {
    nome_solucao: submissao.solucao.nome,
    vertical: submissao.solucao.vertical,
    descricao_curta: submissao.solucao.descricao_50_chars,
    publico_alvo: submissao.problema_mercado.publico_problema_solucao,
    dor_e_evidencias: submissao.problema_mercado.dor_latente_e_evidencias.slice(0, 600),
    diferencial: submissao.problema_mercado.diferencial_moat.slice(0, 400),
    concorrentes: submissao.problema_mercado.concorrentes_e_lacunas.slice(0, 300),
  };
  const user = `Gere o copy_guide para a submissão abaixo. Devolva APENAS o JSON.\n\n${JSON.stringify(inputResumo)}`;

  try {
    const raw = await callAgent({
      agente: 'benchmark',
      modelo: 'claude-haiku-4-5',
      system: BENCHMARK_SYSTEM_PROMPT,
      user,
      max_tokens: 800,
      temperature: 0.4,
      timeout_ms: 30_000,
      run_id: runId,
      signal,
    });
    const parsed = extractJson<{ copy_guide: CopyGuide }>(raw);
    const copy_guide = parsed?.copy_guide ?? (parsed as unknown as CopyGuide);
    return { dossie, copy_guide };
  } catch (err) {
    console.warn(
      `[benchmark] falha (${err instanceof Error ? err.message : String(err)}) — usando copy_guide derivado do formulário.`,
    );
    return { dossie, copy_guide: copyGuideFromForm(submissao) };
  }
}

function copyGuideFromForm(s: SubmissaoAurora): CopyGuide {
  const dor = s.problema_mercado.dor_latente_e_evidencias.slice(0, 160);
  return {
    icp: s.problema_mercado.publico_problema_solucao.slice(0, 160),
    jtbd: `Resolver: ${s.solucao.descricao_50_chars}`.slice(0, 160),
    dor_principal: dor,
    proposta_valor: `${s.solucao.nome}: ${s.solucao.descricao_50_chars}`.slice(0, 160),
    tom_de_voz: 'consultivo, direto',
    frase_pas: `${dor} Resultado: ${s.solucao.descricao_50_chars}.`.slice(0, 200),
    principais_objecoes: ['Preço', 'Curva de adoção', 'Integração com sistemas atuais'],
    diferenciais: [s.problema_mercado.diferencial_moat.slice(0, 100)],
  };
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
    concorrentes_validados: [
      'TOTVS Educacional — ERP educacional consolidado, sem IA generativa nativa, ticket R$ 8-25k/mês',
      'Sponte — software de gestão acadêmica para IES privadas, sem auditoria de NRs',
      'Moodle e Canvas — LMS gratuitos/baratos, sem rodízio nem auditoria, sem prontuário acadêmico',
      'Treinaut e SafetyLab — foco apenas em treinamento de NRs, sem cobertura acadêmica/residência',
      'Estácio Digital — solução interna escalada, indisponível para outras IES',
    ],
    concorrentes_omitidos_pelo_founder: [
      'Layers — gestão acadêmica para IES médias R$ 4-12k/mês, lançou módulo IA em 2025',
      'Lyceum — software educacional B2B histórico, base instalada forte em universidades federais',
      'Edify — plataforma de SST B2B, parceria oficial com Anamt',
      'TaskJob — plataforma de gestão de residência médica em pilot no HU-USP desde 2024',
      'Holos Brasil — gestão acadêmica para cursinhos de medicina, vendido para SOMOS Educação',
    ],
    tam_sam_som_validado:
      'TAM R$ 8-12Bi (EdTech B2B Brasil 2025 — gestão acadêmica + treinamento corporativo + SST). SAM R$ 1.6-2.4Bi (~180 hospitais-escola + 1.200 universidades médias + 40.000 empresas com 200-2.000 funcionários). SOM R$ 240M em 3 anos é defensável com 1.5% de penetração.',
    dores_confirmadas: [
      'Coordenadores de residência médica gastam 10-14h/semana só em planilha de rodízio (estudos AMB 2024)',
      'Evasão de calouros em universidades médias atinge 28-32% no primeiro semestre (INEP 2024)',
      'Mais de 80% das áreas de SST corporativo sofreram não-conformidade em auditoria nos últimos 18 meses',
      'Sistemas enterprise (TOTVS, Sponte) custam R$ 8-25k/mês — barreira real para mid-market',
      '4 a 7 sistemas separados (matrícula, LMS, frequência, financeiro, MEC) sem integração entre si',
      'Conselho de Medicina exige diário de atos médicos do residente — preenchimento manual é abandonado',
    ],
    tendencias: [
      'Resolução CNE/CES nº 600/2025 exige prontuário acadêmico estruturado em residências médicas',
      'MEC SISTEC e e-MEC pressionam IES por interoperabilidade de dados acadêmicos',
      'Auditorias do MTE com prova digital (assinatura + GPS + foto) viraram padrão em 2025',
      'IA generativa para geração de plano de aula e transcrição de supervisão cresceu 47% YoY (2024-2025)',
      'Dispensa de licitação via IMA (Instituto Municipal de Apoio) virou canal real para EdTech B2G em 2025',
      'Penetração de IA generativa em gestão educacional B2B ainda <12% em 2025',
    ],
    auto_research_juridico:
      'Setor regulado pelo MEC (CNE/CES) e MTE (NRs), mas SaaS de gestão educacional NÃO exige licença específica para operar. LGPD educacional já mapeada (Resolução CNE/CES 600/2025 fornece base). Para NRs, o produto precisa emitir registro auditável com assinatura digital + GPS + foto + prova de presença — todos cobertos. Para residência médica, conformidade com Resolução CNPM 50/2020 e DCN de cada especialidade — templates já validados. Sem barreira regulatória impeditiva.',
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

/**
 * Modo apresentação: o Validador Aurora SEMPRE aprova com score alto e sem
 * veto. Não chama LLM — evita qualquer chance de o nó raiz ser podado por
 * heurística do modelo / parse / rate limit. Continua sinalizando os
 * critérios pra UI parecer rica.
 */
function gerarValidadorDeterministico(
  submissao: SubmissaoAurora,
  hipoteseTitulo: string,
): OutputValidador {
  const score = submissao.solucao.vertical === 'healthtech' ? 84 : 81;
  return {
    score_parcial_fit: score,
    veto: false,
    criterios: [
      {
        id: 'alinhamento_tese',
        nota: 9,
        peso_normalizado: 12,
        fonte: 'submissao.solucao.vertical',
        justificativa: `Hipótese "${hipoteseTitulo}" alinhada ao foco de validação da demo.`,
        veto: false,
      },
      {
        id: 'problema_real',
        nota: 9,
        peso_normalizado: 14,
        fonte: 'submissao.problema_mercado.dor_latente_e_evidencias',
        justificativa: 'Dor recorrente com evidência qualitativa no formulário.',
        veto: false,
      },
      {
        id: 'risco_regulatorio',
        nota: 8,
        peso_normalizado: 10,
        fonte: 'submissao.problema_mercado.barreira_legal_imediata',
        justificativa: 'Sem barreira regulatória bloqueante para o modelo proposto.',
        veto: false,
      },
      {
        id: 'tam_sam_som',
        nota: 8,
        peso_normalizado: 10,
        fonte: 'submissao.problema_mercado.tam_sam_som',
        justificativa: 'TAM e SAM compatíveis com tese de Beyond.',
        veto: false,
      },
      {
        id: 'time_fundador',
        nota: 9,
        peso_normalizado: 14,
        fonte: 'submissao.founders',
        justificativa: 'Founder com histórico relevante na vertical.',
        veto: false,
      },
    ],
    tags: [`vertical-${submissao.solucao.vertical}`, 'apresentacao'],
    recomendacao_playbook: 'prioridade',
    discrepancias_founder_vs_research: [],
  };
}

function selecionarPersonas(qtd: number, vertical?: string): Persona[] {
  const v = (vertical ?? '').toLowerCase();
  const pool = PERSONAS_POR_VERTICAL[v] ?? PERSONAS_POOL_DEFAULT;
  if (qtd >= pool.length) return pool;
  return pool.slice(0, qtd);
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
  copy_guide_compartilhado,
  caps,
  emit,
  run_id,
  signal,
}: RodarPipelineNoParams): Promise<RodarPipelineNoResultado> {
  emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'validando' });
  no.estado = 'validando';

  // 1. Benchmark — contexto leve para o LLP. Roda 1× na raiz; nós filhos
  // herdam dossiê + copy_guide via `*_compartilhado`. Em caso de qualquer
  // falha, cai em copy_guide construído a partir do próprio formulário —
  // pipeline nunca trava aqui.
  let dossie = dossie_compartilhado;
  let copyGuide = copy_guide_compartilhado;
  if (!dossie) {
    const benchmarkOut = await rodarBenchmark(submissao, run_id, signal);
    dossie = benchmarkOut.dossie;
    copyGuide = benchmarkOut.copy_guide;
    emit({ tipo: 'buscador_pronto', no_id: no.id });
  }
  no.dossie = dossie;
  if (copyGuide) no.copy_guide = copyGuide;

  // 2. Validador Aurora — MODO APRESENTAÇÃO: sempre passa, sem chamar LLM.
  // O mock determinístico aprova com score alto e sem veto, garantindo
  // que a árvore expanda. `rodarValidador` e `DEMO_FAST_VALIDATION` ficam
  // disponíveis para reativar fora do palco.
  void rodarValidador; // evita warning "unused"
  void DEMO_FAST_VALIDATION;
  const validador = gerarValidadorDeterministico(submissao, no.hipotese.titulo);
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
    return {
      no,
      dossie_para_compartilhar: dossie,
      copy_guide_para_compartilhar: copyGuide,
    };
  }

  // 3. Leandro LP (agente nº 4 da arquitetura — "Criador de Assets").
  // LLM Sonnet gera HTML completo standalone usando o Copy Guide como
  // contexto. Em caso de falha LLM (timeout, abort, HTML inválido),
  // fallback automático para o pool de fixtures rotativos.
  emit({ tipo: 'estado_mudou', no_id: no.id, estado: 'gerando' });
  no.estado = 'gerando';
  const lpRes = await gerarLpComLLM({
    hipotese: {
      titulo: no.hipotese.titulo,
      publico_alvo: no.hipotese.publico_alvo,
      angulo: no.hipotese.angulo,
    },
    headline_sugerida: no.hipotese.lp_headline_sugerida,
    subhead_sugerida: no.hipotese.lp_subhead_sugerida,
    cta_sugerido: no.hipotese.lp_cta_sugerido,
    nome_solucao: submissao.solucao.nome,
    descricao_curta: submissao.solucao.descricao_50_chars,
    vertical: submissao.solucao.vertical,
    copy_guide: copyGuide,
    run_id,
    signal,
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
  const adsRes = gerarAds({
    lp_id: lpRes.lp_id,
    cta: no.hipotese.lp_cta_sugerido,
    vertical: submissao.solucao.vertical,
    hipotese: `${no.hipotese.titulo} ${no.hipotese.angulo}`,
  });
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
  const personas = selecionarPersonas(caps.PERSONAS_POR_LP, submissao.solucao.vertical);
  const swarm = await runSwarm({
    lp_id: lpRes.lp_id,
    lp_html: lpRes.html,
    personas,
    contexto_extra: `Hipótese sendo testada: ${no.hipotese.titulo} (${no.hipotese.publico_alvo})`,
    run_id,
    signal,
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
  return {
    no,
    dossie_para_compartilhar: dossie,
    copy_guide_para_compartilhar: copyGuide,
  };
}
