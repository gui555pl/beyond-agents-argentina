# Schema do Formulário Aurora — Estrutura dos 5 Blocos

> Documentação da estrutura do formulário de submissão Aurora que founders preenchem hoje. É o **input canônico** do Validador Aurora.

## Visão geral

O formulário tem **5 blocos sequenciais**. Cada bloco fornece evidência direta para um ou mais critérios do scorecard. O JSON Schema técnico está em `schemas/input-schema.json`; este documento explica o **conteúdo de cada campo** e o **propósito** dele.

## Bloco 1 — Founders

Lista (≥1 item, com botão "Adicionar" no formulário oficial). Cada item é um founder.

### Sub-bloco: básico
- **Nome completo** — identificação.
- **Telefone** — contato direto.
- **Email** — contato formal e identificação no Volund OS.
- **Gênero** — métrica institucional Aurora (diversidade).
- **Data de nascimento** — sinal de seniority pessoal (não é gate).
- **Cidade** — base geográfica do founder.
- **Redes sociais** — perfis públicos para due diligence informal.

### Sub-bloco: background e trajetória
- **Educação** — formação acadêmica completa.
- **Histórico de trabalho** — empresas, cargos, períodos. Fonte primária do critério 13 (Perfil do Founder).
- **LinkedIn** — URL para verificação pública.
- **Conquistas que se orgulha** — autonarrativa de excelência. Sinal qualitativo de perfil empreendedor.

## Bloco 2 — Solução

- **Nome da solução** — naming.
- **Descrição em ≤50 caracteres** — pitch one-liner. Força clareza.
- **Por que escolheu essa ideia + experiência prática** — narrativa da motivação. Fonte secundária do critério 3 (Problema Real).
- **Vertical** — botão de seleção entre LegalTech / EdTech / HealthTech / GovTech / Outra. Fonte primária dos critérios 2 (Alinhamento Tese) e 6 (Escalabilidade Pública).
- **Pitch Deck (URL)** — opcional, link para slides.
- **Vídeo de Demo até 5min (URL)** — opcional.

## Bloco 3 — Progresso

- **Tempo de trabalho de cada founder** — quanto tempo cada um já dedicou à ideia. Fonte primária do critério 14 (Dono da Briga).
- **Cash balance + burn rate mensal** — situação financeira atual. (Previsão aceita se ainda não fatura.)
- **Projeção de faturamento** — números + premissas. Não entra direto no Validador (modelagem completa é Fase 1 do Ongoing), mas serve como sinal de maturidade.
- **Stack tecnológico** — linguagens, frameworks, modelos IA, ferramentas. Fonte primária do critério 9 (Pesquisa vs Vibe Coding) e secundária dos critérios 1 (Moat), 5 (Escalabilidade Tec), 11 (Conhecimento Interno).
- **É possível reduzir custos / CAC usando a infra de IA e automação da Beyond?** (Sim/Não) — fonte primária dos critérios 7 (Infra Beyond) e 15 (Sinergia Operacional/CAC).
- **É possível testar MVP em até 4 semanas?** (Sim/Não + explicação) — fonte primária do critério 8 (Velocidade MVP).

## Bloco 4 — Problema & Mercado

- **Por que essa ideia + como sabe que as pessoas precisam** — narrativa de descoberta do problema.
- **Qual dor latente + evidências/dados que comprovam** — fonte primária do critério 3 (Problema Real). Evidências fracas ou ausentes reduzem nota.
- **"Para [Públicos/Clientes] que têm [Problema], oferecemos [Solução/Produto]"** — pitch one-liner. Útil para inferir modelo (B2B/B2G/B2C) e tag.
- **Por que somos os melhores? Tecnologia própria, dados exclusivos, posição única** — fonte primária do critério 1 (Moat).
- **Principais concorrentes + o que eles ainda não entenderam** — input para o Buscador comparar e gerar discrepância de "concorrentes omitidos".
- **TAM, SAM, SOM aproximado** — fonte primária do critério 4 (TAM/SAM/SOM). Validado pelo Buscador → discrepância se difere em mais de 1.5x.
- **O modelo permite crescimento de receita sem aumento proporcional de custos?** — fonte primária do critério 5 (Escalabilidade Tecnológica).
- **Possui acesso direto a canais de venda?** — fonte primária dos critérios 12 (Processo Comercial) e 16 (Canais de Venda).
- **Existe alguma barreira legal imediata?** (Sim/Não) — fonte primária do critério 10 (Risco Regulatório - VETO).

## Bloco 5 — Expectativas

- **O que convenceu a aplicar ao modelo de Venture Builder da Beyond** — sinal qualitativo de alinhamento com modelo.
- **Em quais áreas espera receber mais ajuda** (Vendas, Desenvolvimento, Jurídico, Contatos B2G…) — sinal complementar para tag B2G e crítica de gaps.

## Como o Validador consome esse formulário

1. Carrega o JSON completo do formulário no campo `submissao_aurora` do input.
2. Para cada um dos 16 critérios, identifica o **campo-fonte primário** (ver `mapeamento-criterios.md`) e a **fonte secundária**.
3. Atribui nota 1-10 conforme rubrica em `playbook-selecao-aurora.md`.
4. Cita o caminho do campo no `fonte` do output.
5. Cruza com `dossie_buscador` — se diverge, gera entrada em `discrepancias_founder_vs_research`.
