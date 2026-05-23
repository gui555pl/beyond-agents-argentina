# Exemplo 01 — Prioridade (score > 80) — LegalTech B2B

> Caso paradigmático: ideia forte em vertical priorizada, founder experiente, dor real validada, moat tecnológico. Resultado esperado: `recomendacao_playbook = "prioridade"`.

## Contexto narrativo

**Empresa fictícia:** "Conforma" — plataforma SaaS de compliance regulatório bancário automatizado. Lê resoluções do BACEN, BCB e CVM, mapeia obrigações por instituição, automatiza relatórios para auditoria.

**Founder fictícia:** Marina Costa, 34 anos, 7 anos como Head of Compliance em fintech grande (Nubank), fundou empresa anterior de risco de crédito (vendida em 2022). Full-time há 8 meses.

**Hipótese do nó:** "Foco em fintechs e bancos médios (Tier 2), canal direto via rede da founder."

## Input

```json
{
  "submissao_aurora": {
    "founders": [
      {
        "nome": "Marina Costa",
        "telefone": "+55 11 98765-4321",
        "email": "marina@conforma.io",
        "genero": "Feminino",
        "data_nascimento": "1992-03-15",
        "cidade": "São Paulo",
        "redes_sociais": "@marinacosta",
        "educacao": "Direito FGV-SP + MBA em Risk Management LBS",
        "historico_trabalho": "7 anos Nubank (Head of Compliance), 3 anos fundadora Riskly (exit 2022, vendida para Creditas), 2 anos Itaú",
        "linkedin": "linkedin.com/in/marinacosta",
        "conquistas": "Exit de empresa anterior por R$ 12M em 2022. Liderou implementação de compliance Open Finance no Nubank."
      }
    ],
    "solucao": {
      "nome": "Conforma",
      "descricao_50_chars": "Compliance regulatório bancário automatizado",
      "por_que_escolheu": "Vivi a dor por 7 anos no Nubank — equipe de 40 pessoas só para acompanhar mudanças regulatórias do BACEN. Quando saí, bancos médios me procuraram porque não conseguiam contratar essa estrutura.",
      "vertical": "legaltech",
      "pitch_deck_url": "https://conforma.io/deck",
      "video_demo_url": "https://conforma.io/demo"
    },
    "progresso": {
      "tempo_de_trabalho": "8 meses full-time",
      "cash_balance_e_burn_rate": "R$ 380k caixa, R$ 45k/mês burn (2 fundadoras + 1 dev)",
      "projecao_faturamento": "Ano 1: R$ 1.2M ARR (10 contratos a R$ 10k/mês). Ano 2: R$ 6M ARR. Premissa: ticket médio R$ 10k, CAC R$ 8k via rede direta.",
      "stack_tecnologico": "Next.js + Supabase + OpenAI o3 para parsing de normas + RAG sobre base de jurisprudência. Stack 100% sem pesquisa nova.",
      "reduz_custos_com_infra_beyond": true,
      "mvp_em_4_semanas": "Sim. Já temos MVP rodando há 3 meses com 2 clientes em pilot (Banco Original e Pagcerto). Em 4 semanas conseguimos virar produto self-serve."
    },
    "problema_mercado": {
      "por_que_essa_ideia": "Vivi a dor — equipe de compliance no Nubank tinha que ler 200+ resoluções/mês manualmente. Bancos médios não conseguem replicar essa estrutura.",
      "dor_latente_e_evidencias": "Entrevistei 28 heads of compliance de fintechs e bancos médios em 2025. 100% relataram custo de R$ 200k-1M/ano com a função, e 80% admitiram ter recebido multa do BACEN nos últimos 24 meses por gap de monitoramento.",
      "publico_problema_solucao": "Para fintechs reguladas e bancos médios (Tier 2/3) que precisam acompanhar normativos do BACEN/CVM, oferecemos um SaaS que lê, classifica e alerta sobre mudanças regulatórias.",
      "diferencial_moat": "Modelo proprietário fine-tuned em 8 anos de normativos do BACEN + base de jurisprudência exclusiva via parceria com escritório Mattos Filho. Concorrentes usam GPT genérico sem contexto regulatório brasileiro.",
      "concorrentes_e_lacunas": "Concorrentes globais (Hummingbird, Sumsub) são focados em KYC, não em monitoramento normativo. Local: Compliasset (foco em onboarding). Nenhum cobre o que fazemos.",
      "tam_sam_som": "TAM: R$ 1.8Bi (todas fintechs + bancos médios do Brasil). SAM: R$ 600M (Tier 2/3). SOM: R$ 80M em 3 anos.",
      "escalabilidade_sem_custo_proporcional": "SaaS puro. Custo marginal por cliente próximo de zero após ingestão da base regulatória inicial.",
      "canais_de_venda": "Sim. Tenho rede direta com heads of compliance de 40+ fintechs/bancos médios. Pilots iniciais vieram da rede em <30 dias.",
      "barreira_legal_imediata": false
    },
    "expectativas": {
      "convencimento": "Beyond tem expertise em LegalTech regulatório (case da Volund com escritórios). Quero acelerar com canal e validação institucional.",
      "areas_de_ajuda": "Vendas para bancos grandes (Tier 1), Desenvolvimento de RAG sobre jurisprudência, Contatos B2G (BACEN, CVM)."
    }
  },
  "hipotese_no_no": "Foco em fintechs e bancos médios (Tier 2), canal direto via rede da founder.",
  "dossie_buscador": {
    "concorrentes_validados": ["Compliasset (KYC, foco diferente)", "Hummingbird (KYC global)", "Sumsub (KYC global)"],
    "concorrentes_omitidos_pelo_founder": ["Veriff Brasil (lançou módulo regulatório em 2025)", "Cybermondo (player local pequeno)"],
    "tam_sam_som_validado": "TAM Brasil: R$ 1.6-1.9Bi (alinhado). SAM Tier 2/3: R$ 550-650M (alinhado). SOM 3 anos: R$ 70-90M (alinhado).",
    "dores_confirmadas": ["Bancos médios sem capacidade de equipe regulatória dedicada (5 fontes públicas confirmam)", "Multas BACEN cresceram 40% em 2024-2025"],
    "tendencias": ["Open Finance Fase 3 (2026) cria demanda nova", "Pix Internacional adiciona regulamentação cross-border", "Aceleração de fintechs Tier 3 pós-resolução BACEN 4.972"],
    "auto_research_juridico": "Setor regulado (BACEN/CVM) mas sem barreira que inviabilize SaaS de compliance. Nenhuma licença específica exigida para a ferramenta — clientes (bancos) é que precisam de licenças, e o SaaS apenas os ajuda a cumprir."
  }
}
```

## Output esperado

```json
{
  "score_parcial_fit": 92.5,
  "veto": false,
  "criterios": [
    {
      "id": "moat",
      "nota": 9,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.diferencial_moat + dossie.concorrentes_validados",
      "justificativa": "Modelo fine-tuned + parceria exclusiva com Mattos Filho cria moat duplo. Dossiê confirma que concorrentes não cobrem monitoramento normativo brasileiro."
    },
    {
      "id": "alinhamento_tese",
      "nota": 10,
      "peso_normalizado": 7.1,
      "fonte": "formulario.solucao.vertical = legaltech",
      "justificativa": "LegalTech é vertical priorizada explícita da Aurora. Modelo B2B financeiro tem sinergia direta com portfólio Extreme."
    },
    {
      "id": "problema_real",
      "nota": 10,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.dor_latente_e_evidencias + dossie.dores_confirmadas",
      "justificativa": "Founder viveu a dor por 7 anos e validou com 28 entrevistas. Dossiê confirma com 5 fontes públicas de bancos médios sem estrutura regulatória."
    },
    {
      "id": "tam_sam_som",
      "nota": 9,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.tam_sam_som + dossie.tam_sam_som_validado",
      "justificativa": "TAM R$ 1.8Bi declarado e validado pelo Buscador na mesma faixa (R$ 1.6-1.9Bi). SOM R$ 80M crível dado pilots ativos."
    },
    {
      "id": "escalabilidade_tecnologica",
      "nota": 10,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.escalabilidade_sem_custo_proporcional + formulario.progresso.stack_tecnologico",
      "justificativa": "SaaS puro com custo marginal próximo de zero. Stack Next.js + Supabase + IA escala linearmente sem expansão de equipe."
    },
    {
      "id": "escalabilidade_publica_b2g",
      "nota": 6,
      "peso_normalizado": 7.1,
      "fonte": "formulario.solucao.vertical + formulario.expectativas.areas_de_ajuda",
      "justificativa": "Founder citou BACEN/CVM como contato B2G nas expectativas. Possibilidade futura, não core do MVP."
    },
    {
      "id": "infra_beyond",
      "nota": 9,
      "peso_normalizado": 3.6,
      "fonte": "formulario.progresso.reduz_custos_com_infra_beyond = true",
      "justificativa": "Founder marcou SIM. Plano claro: usar canal de marketing Beyond para bancos médios + componentes IA do grupo."
    },
    {
      "id": "velocidade_mvp",
      "nota": 10,
      "peso_normalizado": 7.1,
      "fonte": "formulario.progresso.mvp_em_4_semanas",
      "justificativa": "MVP já existe há 3 meses com 2 pilots ativos. Self-serve em 4 semanas é factível."
    },
    {
      "id": "pesquisa_vs_vibe_coding",
      "nota": 9,
      "peso_normalizado": 3.6,
      "fonte": "formulario.progresso.stack_tecnologico",
      "justificativa": "Stack 100% buildable com IA generativa atual + RAG. Sem pesquisa nova exigida."
    },
    {
      "id": "risco_regulatorio",
      "nota": 8,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.barreira_legal_imediata = false + dossie.auto_research_juridico",
      "justificativa": "Setor regulado, mas SaaS não exige licença própria — clientes que precisam de licenças. LGPD aplicável e gerenciável."
    },
    {
      "id": "conhecimento_interno",
      "nota": 7,
      "peso_normalizado": 3.6,
      "fonte": "formulario.progresso.stack_tecnologico",
      "justificativa": "Stack conhecida pela Beyond. Beyond não operou LegalTech regulatório financeiro especificamente, mas tem casos em LegalTech adjacente (escritórios)."
    },
    {
      "id": "processo_comercial",
      "nota": 10,
      "peso_normalizado": 3.6,
      "fonte": "formulario.problema_mercado.canais_de_venda + formulario.founders[0].historico_trabalho",
      "justificativa": "Founder tem rede direta com 40+ heads of compliance. Pilots já vieram dessa rede em <30 dias."
    },
    {
      "id": "perfil_founder",
      "nota": 10,
      "peso_normalizado": 14.4,
      "fonte": "formulario.founders[0] (Educação + Histórico + LinkedIn + Conquistas)",
      "justificativa": "Founder serial com exit anterior (R$ 12M, 2022), Head of Compliance em Nubank, MBA LBS. Perfil empreendedor consolidado e expertise no domínio."
    },
    {
      "id": "dono_da_briga",
      "nota": 10,
      "peso_normalizado": 14.4,
      "fonte": "formulario.progresso.tempo_de_trabalho",
      "justificativa": "Full-time há 8 meses, com burn ativo e pilots em produção. Dedicação 100% comprovada."
    },
    {
      "id": "sinergia_operacional_cac",
      "nota": 9,
      "peso_normalizado": 0,
      "fonte": "formulario.progresso.reduz_custos_com_infra_beyond (correlacionado com critério infra_beyond)",
      "justificativa": "Correlacionado ao critério 7. Peso normalizado zerado para evitar dupla contagem."
    },
    {
      "id": "canais_de_venda",
      "nota": 10,
      "peso_normalizado": 0,
      "fonte": "formulario.problema_mercado.canais_de_venda (correlacionado com critério processo_comercial)",
      "justificativa": "Correlacionado ao critério 12. Founder tem acesso direto demonstrado."
    }
  ],
  "tags": [
    "vertical-priorizada-legaltech",
    "modelo-b2b",
    "estagio-validacao",
    "conveniencia-pessoas"
  ],
  "recomendacao_playbook": "prioridade",
  "discrepancias_founder_vs_research": [
    {
      "campo": "problema_mercado.concorrentes_e_lacunas",
      "founder": "Compliasset, Hummingbird, Sumsub (3 listados)",
      "research": "Buscador encontrou +2: Veriff Brasil (módulo regulatório recente) e Cybermondo",
      "severidade": "media"
    }
  ]
}
```

## Observações sobre este caso

- **Score 92.5**: ideia forte em quase todos os critérios — sem nota abaixo de 6. Justifica `prioridade` (fast-track no Comitê).
- **Discrepância média**: founder não listou 2 concorrentes relevantes. Não veta, mas vira sinal qualitativo — o Comitê deve perguntar se a omissão foi por desconhecimento (sinal ruim) ou se Veriff/Cybermondo não foram considerados relevantes (sinal neutro).
- **Tag `conveniencia-pessoas`**: anexada porque automatizar compliance libera tempo de profissionais para tarefas de maior valor — conveniência indireta.
- **Estágio `validacao`** (não `ideacao`): MVP rodando há 3 meses com 2 pilots ativos justifica estágio mais avançado.
