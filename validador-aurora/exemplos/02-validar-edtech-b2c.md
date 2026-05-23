# Exemplo 02 — Validar (60-80) — EdTech B2C

> Caso intermediário: ideia plausível em vertical priorizada, mas com B2C (alerta), founder júnior, evidência de dor fraca e discrepâncias relevantes em TAM e concorrentes. Resultado esperado: `recomendacao_playbook = "validar"`.

## Contexto narrativo

**Empresa fictícia:** "Estudaí" — app mobile que usa IA para gerar planos de estudo personalizados para vestibulandos a partir de simulados e métricas de tempo gasto.

**Founder fictício:** Lucas Almeida, 24 anos, recém-formado em Ciência da Computação USP, primeiro projeto empreendedor. Part-time (sai de um estágio em junho).

**Hipótese do nó:** "Foco em vestibulandos de classe C/D que estudam para ENEM, modelo freemium com upsell para premium."

## Input

```json
{
  "submissao_aurora": {
    "founders": [
      {
        "nome": "Lucas Almeida",
        "telefone": "+55 11 91234-5678",
        "email": "lucas@estudai.app",
        "genero": "Masculino",
        "data_nascimento": "2001-08-22",
        "cidade": "São Paulo",
        "redes_sociais": "@luksdev",
        "educacao": "BSc Ciência da Computação USP (2025)",
        "historico_trabalho": "Estágio em frontend na Hotmart (1 ano). Monitor em projeto de iniciação científica em IA na USP.",
        "linkedin": "linkedin.com/in/lucasalmeida-dev",
        "conquistas": "Top 5% no ENEM 2019. Hackathon USP 2024 (3o lugar)."
      }
    ],
    "solucao": {
      "nome": "Estudaí",
      "descricao_50_chars": "Plano de estudo IA pra vestibular",
      "por_que_escolheu": "Estudei para o ENEM sem orientação e perdi tempo com matérias erradas. Quero que IA ajude a otimizar o estudo de quem não tem cursinho.",
      "vertical": "edtech",
      "pitch_deck_url": "",
      "video_demo_url": ""
    },
    "progresso": {
      "tempo_de_trabalho": "3 meses part-time. Vou para full-time em julho/2026 quando o estágio acabar.",
      "cash_balance_e_burn_rate": "R$ 12k caixa próprio. Sem burn formal (founder solo, sem salário).",
      "projecao_faturamento": "Ano 1: R$ 240k (8k usuários pagos a R$ 30/mês). Ano 2: R$ 1.8M.",
      "stack_tecnologico": "React Native + Firebase + OpenAI GPT-4o-mini para geração de planos. Stack padrão, sem pesquisa nova.",
      "reduz_custos_com_infra_beyond": true,
      "mvp_em_4_semanas": "Sim. Já tenho protótipo navegável, em 4 semanas consigo lançar versão fechada na App Store."
    },
    "problema_mercado": {
      "por_que_essa_ideia": "Vestibular é uma das maiores dores de jovens brasileiros, e cursinho não é acessível pra todos.",
      "dor_latente_e_evidencias": "Conversei com 12 amigos que fizeram ENEM. Todos disseram que perderam tempo estudando coisa errada. Mercado de cursinhos online (Descomplica, Me Salva) prova que tem demanda.",
      "publico_problema_solucao": "Para vestibulandos de classe C/D que estudam para ENEM sem orientação de cursinho, oferecemos um app que gera plano personalizado e ajusta semanalmente.",
      "diferencial_moat": "IA generativa adaptativa que ajusta o plano em tempo real conforme o aluno faz simulados. Concorrentes têm planos fixos.",
      "concorrentes_e_lacunas": "Descomplica (foco em videoaula, não em plano personalizado). Me Salva (similar).",
      "tam_sam_som": "TAM: R$ 50Bi (todo mercado de educação brasileiro). SAM: R$ 5Bi (vestibulandos). SOM: R$ 500M em 3 anos.",
      "escalabilidade_sem_custo_proporcional": "App mobile, custo marginal baixo. Custo de IA escala com uso, mas em modelo freemium o pagante cobre.",
      "canais_de_venda": "Marketing orgânico no TikTok e Instagram (tenho 8k seguidores como criador de conteúdo de tech). Parceria com cursinhos pequenos.",
      "barreira_legal_imediata": false
    },
    "expectativas": {
      "convencimento": "Beyond tem expertise em EdTech (case Volund com universidades). Quero estrutura e mentoria para escalar.",
      "areas_de_ajuda": "Vendas, Marketing digital, Contatos com cursinhos."
    }
  },
  "hipotese_no_no": "Foco em vestibulandos de classe C/D que estudam para ENEM, modelo freemium com upsell para premium.",
  "dossie_buscador": {
    "concorrentes_validados": ["Descomplica (gigante, mas foco diferente)", "Me Salva (médio)"],
    "concorrentes_omitidos_pelo_founder": ["Stoodi (player direto, plano personalizado)", "Plataforma do Casimiro (Cazé Educa)", "Aprovado.com.br (segmentado em classe C/D)", "Estuda.com (foco em plano personalizado)"],
    "tam_sam_som_validado": "TAM ENEM Brasil: R$ 800M-1.2Bi (mercado de produtos digitais para ENEM). SAM realista para classe C/D: R$ 150-300M. SOM 3 anos: R$ 20-50M. Founder superestimou em ~5x.",
    "dores_confirmadas": ["Falta de orientação para vestibulandos sem cursinho — confirmado em pesquisas do INEP", "Mercado de cursinho online em crescimento (20% YoY)"],
    "tendencias": ["IA generativa em EdTech crescendo, mas mercado lotado de novos entrantes em 2025-2026", "App store EdTech tem CAC subindo (R$ 80-150 por usuário pago em 2026)"],
    "auto_research_juridico": "Setor sem barreira jurídica relevante. LGPD aplicável (menor de idade demanda consentimento parental — gerenciável)."
  }
}
```

## Output esperado

```json
{
  "score_parcial_fit": 65.4,
  "veto": false,
  "criterios": [
    {
      "id": "moat",
      "nota": 6,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.diferencial_moat + dossie.concorrentes_omitidos_pelo_founder",
      "justificativa": "IA adaptativa é diferencial visível vs. videoaula fixa (Descomplica), mas replicável em 6-12 meses. Dossiê mostra 4 concorrentes com plano personalizado já no ar (Stoodi, Estuda.com)."
    },
    {
      "id": "alinhamento_tese",
      "nota": 8,
      "peso_normalizado": 7.1,
      "fonte": "formulario.solucao.vertical = edtech",
      "justificativa": "EdTech é vertical priorizada. Nota reduzida porque modelo B2C foge da tese explícita Aurora (preferência B2B/B2G)."
    },
    {
      "id": "problema_real",
      "nota": 7,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.dor_latente_e_evidencias + dossie.dores_confirmadas",
      "justificativa": "Dor confirmada externamente pelo INEP (vestibulandos sem orientação). Evidência do founder é fraca (12 amigos entrevistados, amostra enviesada), mas a dor existe."
    },
    {
      "id": "tam_sam_som",
      "nota": 4,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.tam_sam_som + dossie.tam_sam_som_validado",
      "justificativa": "Founder declarou TAM R$ 50Bi (todo mercado de educação). Buscador estimou TAM para ENEM em R$ 800M-1.2Bi — superestimação de ~5x. SOM declarado R$ 500M vs. R$ 20-50M real."
    },
    {
      "id": "escalabilidade_tecnologica",
      "nota": 8,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.escalabilidade_sem_custo_proporcional + formulario.progresso.stack_tecnologico",
      "justificativa": "App mobile com custo marginal baixo. Único risco: CAC subindo no App Store EdTech (R$ 80-150 conforme dossiê) pode pressionar margem."
    },
    {
      "id": "escalabilidade_publica_b2g",
      "nota": 4,
      "peso_normalizado": 7.1,
      "fonte": "formulario.solucao.vertical + formulario.expectativas.areas_de_ajuda",
      "justificativa": "Nenhuma referência a canal B2G. Modelo B2C puro voltado a alunos individuais."
    },
    {
      "id": "infra_beyond",
      "nota": 6,
      "peso_normalizado": 3.6,
      "fonte": "formulario.progresso.reduz_custos_com_infra_beyond = true",
      "justificativa": "Founder marcou SIM, mas sem detalhar como. Possível uso de canal de marketing Beyond, infra IA pode reduzir custo de GPT."
    },
    {
      "id": "velocidade_mvp",
      "nota": 9,
      "peso_normalizado": 7.1,
      "fonte": "formulario.progresso.mvp_em_4_semanas",
      "justificativa": "Protótipo navegável já existente + stack simples (React Native + Firebase). MVP em 4 semanas é factível com folga."
    },
    {
      "id": "pesquisa_vs_vibe_coding",
      "nota": 10,
      "peso_normalizado": 3.6,
      "fonte": "formulario.progresso.stack_tecnologico",
      "justificativa": "Stack 100% buildable com IA generativa. Zero pesquisa nova."
    },
    {
      "id": "risco_regulatorio",
      "nota": 7,
      "peso_normalizado": 7.1,
      "fonte": "formulario.problema_mercado.barreira_legal_imediata = false + dossie.auto_research_juridico",
      "justificativa": "Sem barreira regulatória relevante. LGPD aplicável (menor de idade demanda consentimento parental), gerenciável com termos adequados."
    },
    {
      "id": "conhecimento_interno",
      "nota": 7,
      "peso_normalizado": 3.6,
      "fonte": "formulario.progresso.stack_tecnologico",
      "justificativa": "EdTech é vertical bem conhecida pela Beyond. Stack React Native + Firebase é estabelecida internamente."
    },
    {
      "id": "processo_comercial",
      "nota": 6,
      "peso_normalizado": 3.6,
      "fonte": "formulario.problema_mercado.canais_de_venda + formulario.founders[0].historico_trabalho",
      "justificativa": "Founder tem 8k seguidores como criador (canal orgânico TikTok/Instagram) e plano de parceria com cursinhos. Sem histórico comercial empresarial."
    },
    {
      "id": "perfil_founder",
      "nota": 5,
      "peso_normalizado": 14.4,
      "fonte": "formulario.founders[0] (Educação + Histórico + LinkedIn + Conquistas)",
      "justificativa": "Founder júnior, recém-formado em CC USP. Top 5% ENEM 2019 e 3o lugar hackathon USP são sinais de capacidade, mas sem trajetória empreendedora ainda."
    },
    {
      "id": "dono_da_briga",
      "nota": 7,
      "peso_normalizado": 14.4,
      "fonte": "formulario.progresso.tempo_de_trabalho",
      "justificativa": "Part-time há 3 meses, com plano firme (data marcada) de virar full-time em julho/2026. Transição em curso, dedicação alta."
    },
    {
      "id": "sinergia_operacional_cac",
      "nota": 6,
      "peso_normalizado": 0,
      "fonte": "formulario.progresso.reduz_custos_com_infra_beyond (correlacionado com critério infra_beyond)",
      "justificativa": "Correlacionado ao critério 7. Mesma nota."
    },
    {
      "id": "canais_de_venda",
      "nota": 6,
      "peso_normalizado": 0,
      "fonte": "formulario.problema_mercado.canais_de_venda (correlacionado com critério processo_comercial)",
      "justificativa": "Correlacionado ao critério 12. Canal orgânico próprio testado + plano de parcerias."
    }
  ],
  "tags": [
    "vertical-priorizada-edtech",
    "modelo-b2c",
    "estagio-ideacao",
    "conveniencia-pessoas"
  ],
  "recomendacao_playbook": "validar",
  "discrepancias_founder_vs_research": [
    {
      "campo": "problema_mercado.tam_sam_som",
      "founder": "TAM R$ 50Bi, SAM R$ 5Bi, SOM R$ 500M em 3 anos",
      "research": "TAM ENEM R$ 800M-1.2Bi; SAM classe C/D R$ 150-300M; SOM realista R$ 20-50M. Superestimação de ~5x.",
      "severidade": "alta"
    },
    {
      "campo": "problema_mercado.concorrentes_e_lacunas",
      "founder": "Listou apenas Descomplica e Me Salva (focados em videoaula)",
      "research": "Buscador encontrou +4 concorrentes diretos com plano personalizado: Stoodi, Cazé Educa, Aprovado.com.br, Estuda.com",
      "severidade": "alta"
    },
    {
      "campo": "problema_mercado.dor_latente_e_evidencias",
      "founder": "12 amigos entrevistados",
      "research": "Dor confirmada pelo INEP, mas amostra do founder é pequena e enviesada (todos amigos)",
      "severidade": "media"
    }
  ]
}
```

## Observações sobre este caso

- **Score 65.4**: cai dentro da faixa `validar`. Ideia tem mérito (vertical certa, dor confirmada externamente, MVP viável, founder com sinais de capacidade) mas TAM exagerado, B2C fora da tese e perfil júnior puxam pra baixo.
- **3 discrepâncias relevantes**: TAM superestimado em 5x e omissão de 4 concorrentes diretos são sinais qualitativos importantes. O Comitê deve perguntar se foi por desconhecimento ou por escolha de framing.
- **Tag `modelo-b2c`**: anexada com alerta "fora da tese explícita" (regra da tese). UI deve sinalizar.
- **Estágio `ideacao`** (não `validacao`): protótipo navegável é diferente de MVP em produção; founder ainda não validou conversão real.
- **Critérios 13 e 14**: junior + primeira empreitada limita perfil_founder a 5 (não 7-8). Dono_da_briga em 7 reflete a transição clara para full-time em julho.
