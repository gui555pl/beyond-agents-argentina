# Exemplo 03 — VETO Regulatório — HealthTech

> Caso de VETO acionado: HealthTech que pretende ofertar diagnóstico médico via IA sem registro ANVISA + sem médico no loop. Founder declarou ausência de barreira; dossiê confirma barreira ativa. Resultado esperado: `veto: true`, `recomendacao_playbook = "descartar"`.

## Contexto narrativo

**Empresa fictícia:** "DermAI" — app mobile que usa IA de visão computacional para diagnosticar lesões de pele a partir de fotos do usuário (sem médico envolvido).

**Founder fictício:** Renan Pereira, 31 anos, ex-PhD em Computer Vision (MIT), 5 anos como Research Scientist em healthtech americana (Tempus). Voltou ao Brasil em 2024.

**Hipótese do nó:** "App B2C para detecção precoce de melanoma e outras lesões, freemium com diagnóstico premium."

## Input

```json
{
  "submissao_aurora": {
    "founders": [
      {
        "nome": "Renan Pereira",
        "telefone": "+55 21 99876-5432",
        "email": "renan@dermai.health",
        "genero": "Masculino",
        "data_nascimento": "1994-11-08",
        "cidade": "Rio de Janeiro",
        "redes_sociais": "@renanp_ai",
        "educacao": "PhD Computer Vision MIT 2022. BSc Engenharia Eletrônica ITA.",
        "historico_trabalho": "2 anos Research Scientist Tempus (oncologia). 1 ano pesquisa Google Health. 2 anos staff engineer Microsoft Research.",
        "linkedin": "linkedin.com/in/renanpereira",
        "conquistas": "8 papers em CVPR/NeurIPS. Modelo state-of-the-art em segmentação dermatológica em 2023."
      }
    ],
    "solucao": {
      "nome": "DermAI",
      "descricao_50_chars": "Diagnóstico de lesões de pele via IA",
      "por_que_escolheu": "Acesso a dermatologista no SUS demora 6-12 meses no Brasil. IA pode dar diagnóstico em segundos a partir de foto.",
      "vertical": "healthtech",
      "pitch_deck_url": "https://dermai.health/deck",
      "video_demo_url": "https://dermai.health/demo"
    },
    "progresso": {
      "tempo_de_trabalho": "11 meses full-time",
      "cash_balance_e_burn_rate": "R$ 280k caixa (investimento próprio do founder após exit do Tempus). Burn R$ 35k/mês (founder + 1 dev ML).",
      "projecao_faturamento": "Ano 1: R$ 600k (20k usuários pagos a R$ 30/mês). Ano 2: R$ 4M.",
      "stack_tecnologico": "Modelo proprietário ViT fine-tuned em dataset de 200k imagens dermatológicas (parceria com universidades). Deploy: app React Native + servidor inferência GPU.",
      "reduz_custos_com_infra_beyond": false,
      "mvp_em_4_semanas": "Sim. Já temos protótipo com modelo treinado. Em 4 semanas conseguimos lançar app em beta fechado."
    },
    "problema_mercado": {
      "por_que_essa_ideia": "Vi nos EUA como IA reduz tempo de diagnóstico em câncer. No Brasil o problema é maior porque o acesso ao dermatologista é precário no SUS.",
      "dor_latente_e_evidencias": "Brasileiros esperam 6-12 meses por dermatologista no SUS. 18% dos brasileiros têm algum tipo de lesão suspeita não diagnosticada (INCA 2024). Câncer de pele é o mais comum no Brasil.",
      "publico_problema_solucao": "Para brasileiros que suspeitam de lesão de pele e não têm acesso rápido a dermatologista, oferecemos diagnóstico via IA em segundos a partir de foto.",
      "diferencial_moat": "Modelo state-of-the-art em segmentação dermatológica (8 papers de autoria). Dataset proprietário de 200k imagens.",
      "concorrentes_e_lacunas": "SkinVision (Holanda, opera no Brasil). MoleScope (Canadá). Nenhum com modelo do nosso nível de acurácia.",
      "tam_sam_som": "TAM: R$ 4Bi (todo mercado de saúde digital BR). SAM: R$ 800M (dermatologia digital). SOM: R$ 80M em 3 anos.",
      "escalabilidade_sem_custo_proporcional": "App mobile com inferência IA. Custo marginal por usuário próximo de zero após treino do modelo.",
      "canais_de_venda": "App store (orgânico) + parceria com planos de saúde (em conversa com SulAmérica).",
      "barreira_legal_imediata": false
    },
    "expectativas": {
      "convencimento": "Beyond tem expertise em HealthTech (case Volund com hospitais). Quero acelerar canal e validação institucional.",
      "areas_de_ajuda": "Jurídico, Vendas para planos de saúde, Validação clínica."
    }
  },
  "hipotese_no_no": "App B2C para detecção precoce de melanoma e outras lesões, freemium com diagnóstico premium.",
  "dossie_buscador": {
    "concorrentes_validados": ["SkinVision (opera no Brasil)", "MoleScope (Canadá)"],
    "concorrentes_omitidos_pelo_founder": ["TeleDermBR (telemedicina com médico no loop, modelo legalmente viável)", "Conexa Saúde (telemedicina geral)"],
    "tam_sam_som_validado": "TAM saúde digital Brasil: R$ 3-5Bi (alinhado). SAM dermatologia digital regulamentada: R$ 400-700M (50% menor que declarado, dado restrição regulatória). SOM realista: R$ 15-40M.",
    "dores_confirmadas": ["Espera de 6-12 meses por dermatologista SUS confirmada por DATASUS", "INCA 2024 confirma alta prevalência de câncer de pele"],
    "tendencias": ["Telemedicina cresceu 5x pós-pandemia (CFM)", "ANVISA atualizou RDC 657/2022 sobre dispositivos médicos com IA: classe IIa exige registro completo"],
    "auto_research_juridico": "**BARREIRA REGULATÓRIA ATIVA E SEVERA.** (1) CFM Resolução 2.314/2022 PROÍBE diagnóstico médico via IA sem médico no loop — o ato médico do diagnóstico é privativo. (2) ANVISA RDC 657/2022 classifica software de diagnóstico dermatológico como dispositivo médico classe IIa, exigindo registro completo (12-18 meses de processo, estudos clínicos, certificação ISO 13485). (3) Modelo proposto (diagnóstico direto ao paciente sem médico) é EXPLICITAMENTE proibido pela atual regulamentação. Há precedente: SkinVision teve atuação restringida no Brasil em 2024 por essa razão. Modelo legalmente viável seria 'triagem' que SUGERE consulta — mas não 'diagnóstico'."
  }
}
```

## Output esperado

```json
{
  "score_parcial_fit": 74.3,
  "veto": true,
  "criterios": [
    {
      "id": "moat",
      "nota": 9,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.diferencial_moat + formulario.founders[0].conquistas",
      "justificativa": "Modelo proprietário state-of-the-art com 8 papers de autoria + dataset exclusivo de 200k imagens. Moat técnico forte e defensável."
    },
    {
      "id": "alinhamento_tese",
      "nota": 9,
      "peso_normalizado": 7.1,
      "fonte": "formulario.solucao.vertical = healthtech",
      "justificativa": "HealthTech é vertical priorizada explícita da Aurora. Modelo B2C reduz nota (preferência B2B/B2G), mas vertical é correta."
    },
    {
      "id": "problema_real",
      "nota": 9,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.dor_latente_e_evidencias + dossie.dores_confirmadas",
      "justificativa": "Dor real e bem dimensionada. DATASUS e INCA confirmam espera SUS e prevalência. Founder tem acesso a dados clínicos pelo histórico Tempus."
    },
    {
      "id": "tam_sam_som",
      "nota": 6,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.tam_sam_som + dossie.tam_sam_som_validado",
      "justificativa": "TAM declarado R$ 4Bi alinhado com Buscador. SAM superestimado (R$ 800M vs. R$ 400-700M real) porque founder não considerou restrição regulatória que limita mercado endereçável."
    },
    {
      "id": "escalabilidade_tecnologica",
      "nota": 8,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.escalabilidade_sem_custo_proporcional + formulario.progresso.stack_tecnologico",
      "justificativa": "Custo marginal baixo por usuário. Único risco: custo de GPU para inferência em escala pode pressionar margem em modelo freemium B2C."
    },
    {
      "id": "escalabilidade_publica_b2g",
      "nota": 5,
      "peso_normalizado": 7.1,
      "fonte": "formulario.solucao.vertical + formulario.expectativas.areas_de_ajuda",
      "justificativa": "Potencial via SUS existe (founder cita o problema do acesso), mas modelo B2C atual não aproveita. Pivot para B2G/SUS seria desenho diferente."
    },
    {
      "id": "infra_beyond",
      "nota": 3,
      "peso_normalizado": 3.6,
      "fonte": "formulario.progresso.reduz_custos_com_infra_beyond = false",
      "justificativa": "Founder marcou NÃO. Modelo proprietário próprio + infra ML especializada não se beneficia da infra Beyond padrão."
    },
    {
      "id": "velocidade_mvp",
      "nota": 8,
      "peso_normalizado": 7.1,
      "fonte": "formulario.progresso.mvp_em_4_semanas",
      "justificativa": "Founder declara SIM com modelo já treinado e protótipo pronto. Plano de beta em 4 semanas é factível tecnicamente."
    },
    {
      "id": "pesquisa_vs_vibe_coding",
      "nota": 5,
      "peso_normalizado": 3.6,
      "fonte": "formulario.progresso.stack_tecnologico",
      "justificativa": "Modelo proprietário ViT fine-tuned em dataset clínico é pesquisa específica de domínio — não é vibe coding puro. Founder tem expertise, mas escalar modelo exige retreino contínuo."
    },
    {
      "id": "risco_regulatorio",
      "nota": 1,
      "peso_normalizado": 7.1,
      "veto": true,
      "fonte": "formulario.problema_mercado.barreira_legal_imediata = false (founder) + dossie.auto_research_juridico = barreira ativa severa (research)",
      "justificativa": "**VETO.** Founder declarou ausência de barreira, mas auto-research jurídico confirma 3 barreiras inviabilizantes: (1) CFM Resolução 2.314/2022 proíbe diagnóstico médico via IA sem médico no loop; (2) ANVISA RDC 657/2022 exige registro completo (12-18 meses) para software de diagnóstico classe IIa; (3) Precedente SkinVision (restringido em 2024). Modelo atual é PROIBIDO por lei. Pivot para 'triagem que sugere consulta médica' seria legalmente viável, mas requer redesenho."
    },
    {
      "id": "conhecimento_interno",
      "nota": 5,
      "peso_normalizado": 3.6,
      "fonte": "formulario.progresso.stack_tecnologico",
      "justificativa": "HealthTech é vertical conhecida pela Beyond, mas Computer Vision médico é stack adjacente, não core do grupo."
    },
    {
      "id": "processo_comercial",
      "nota": 5,
      "peso_normalizado": 3.6,
      "fonte": "formulario.problema_mercado.canais_de_venda + formulario.founders[0].historico_trabalho",
      "justificativa": "Founder em conversa com SulAmérica, mas sem rede consolidada em planos de saúde no Brasil. Canal app store é orgânico mas não direto."
    },
    {
      "id": "perfil_founder",
      "nota": 10,
      "peso_normalizado": 14.4,
      "fonte": "formulario.founders[0] (PhD MIT + Tempus + Google Health + Microsoft Research)",
      "justificativa": "Founder excepcional: PhD MIT em Computer Vision, 5 anos em healthtechs líderes globais, 8 papers de alto impacto. Perfil técnico de classe mundial."
    },
    {
      "id": "dono_da_briga",
      "nota": 10,
      "peso_normalizado": 14.4,
      "fonte": "formulario.progresso.tempo_de_trabalho",
      "justificativa": "Full-time há 11 meses, investimento próprio de R$ 280k, burn ativo. Dedicação total comprovada."
    },
    {
      "id": "sinergia_operacional_cac",
      "nota": 3,
      "peso_normalizado": 0,
      "fonte": "formulario.progresso.reduz_custos_com_infra_beyond = false (correlacionado com critério infra_beyond)",
      "justificativa": "Correlacionado ao critério 7. Mesma nota."
    },
    {
      "id": "canais_de_venda",
      "nota": 5,
      "peso_normalizado": 0,
      "fonte": "formulario.problema_mercado.canais_de_venda (correlacionado com critério processo_comercial)",
      "justificativa": "Correlacionado ao critério 12. Canal em construção, sem rede empresarial direta."
    }
  ],
  "tags": [
    "vertical-priorizada-healthtech",
    "modelo-b2c",
    "estagio-validacao",
    "conveniencia-pessoas"
  ],
  "recomendacao_playbook": "descartar",
  "discrepancias_founder_vs_research": [
    {
      "campo": "problema_mercado.barreira_legal_imediata",
      "founder": "false (sem barreira)",
      "research": "BARREIRA SEVERA: CFM Resolução 2.314/2022 (diagnóstico é ato médico privativo) + ANVISA RDC 657/2022 (registro classe IIa exigido) + precedente SkinVision restringido em 2024",
      "severidade": "alta"
    },
    {
      "campo": "problema_mercado.tam_sam_som",
      "founder": "SAM R$ 800M (dermatologia digital)",
      "research": "SAM realista R$ 400-700M considerando restrição regulatória que reduz mercado endereçável",
      "severidade": "media"
    },
    {
      "campo": "problema_mercado.concorrentes_e_lacunas",
      "founder": "Listou SkinVision e MoleScope (concorrentes com mesmo modelo problemático)",
      "research": "Buscador encontrou TeleDermBR e Conexa Saúde — modelos legalmente viáveis (telemedicina com médico no loop) que founder não considerou",
      "severidade": "media"
    }
  ]
}
```

## Observações sobre este caso

- **VETO acionado**: critério 10 = 1 com justificativa detalhada citando 3 barreiras regulatórias específicas. `veto: true` no critério e no root.
- **`recomendacao_playbook = "descartar"`** (automático por VETO, prevalece sobre o score).
- **Score 74.3** ainda é calculado — mostra que, **sem o veto**, a ideia seria forte (founder excepcional, moat técnico, dor real) e ficaria em `validar`. Mas modelo proibido por lei não tem compensação possível.
- **Discrepância alta em barreira regulatória**: o sinal mais grave. Founder marcou "false" mas dossiê confirma barreira ativa severa. Isso vai como alerta primário no relatório executivo.
- **Próximo passo possível (não automatizado)**: Comitê pode sugerir pivot — DermAI como "triagem que sugere consulta médica" seria legalmente viável (RDC 657 exige menos para classe I) e abriria caminho B2B com planos de saúde + médicos. Mas isso é decisão humana, não output do Validador.
- **Tag `conveniencia-pessoas`** mantida apesar do veto: a ideia *bate* com o propósito Aurora, é só que o modelo proposto não é viável legalmente.
