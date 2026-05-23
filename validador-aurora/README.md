# Validador Aurora — Pacote de Insumos para Volund OS

> Pacote modular para criar o agente **Validador Aurora** no Volund OS. Parte do pipeline Beyond Agents (hackathon 22-23 mai 2026).

## O que é o Validador Aurora?

Agente LLM que aplica o **scorecard do Playbook de Seleção Aurora** sobre uma hipótese de negócio. É o **único agente do pipeline com conhecimento institucional da Beyond** — traduz para automação o trabalho que o Comitê de Inovação Aurora faz hoje manualmente na Fase 1 (Screening).

**Input:** formulário Aurora completo preenchido pelo founder + hipótese específica do nó da árvore + dossiê do Buscador.

**Output:** JSON com score parcial de fit estratégico, notas por critério (16 critérios), tags da tese, recomendação ("descartar"/"validar"/"prioridade"), discrepâncias founder vs research, e flag de VETO regulatório quando aplicável.

**Princípios:**
- Não é gate booleano — sempre roda até o fim.
- Cada nota tem fonte explícita no formulário ou no dossiê.
- VETO regulatório (critério 10 = nota 1) é a única poda imediata.
- Não decide investimento — alimenta o Comitê humano.
- Raciocínio puro sobre input estruturado, sem ferramentas externas.

## Estrutura do Pacote

```
validador-aurora/
├── README.md                                     # Este arquivo
├── system-prompt.md                              # System prompt completo do agente
│
├── schemas/
│   ├── input-schema.json                         # JSON Schema do input
│   └── output-schema.json                        # JSON Schema do output
│
├── base-de-conhecimento/
│   ├── playbook-selecao-aurora.md                # Rubricas detalhadas dos 16 critérios
│   ├── tese-investimento-aurora.md               # Verticais priorizadas, propósito, modelos
│   ├── schema-formulario-aurora.md               # Estrutura dos 5 blocos do formulário
│   ├── mapeamento-criterios.md                   # Campo do formulário ↔ critério do scorecard
│   ├── cortes-recomendacoes.md                   # Faixas de recomendação + lógica de VETO
│   └── fronteiras-do-agente.md                   # O que o Validador NÃO faz
│
├── skills/
│   └── processar-submissao-aurora/
│       └── SKILL.md                              # Roteiro mestre end-to-end
│
├── exemplos/
│   ├── 01-prioridade-legaltech-b2b.md            # Caso ideal (score > 80)
│   ├── 02-validar-edtech-b2c.md                  # Caso intermediário (60-80) com discrepâncias
│   └── 03-veto-regulatorio-saude.md              # Caso vetado
│
└── memory/
    ├── MEMORY.md
    ├── project_aurora_context.md
    ├── reference_playbook_selecao.md
    └── feedback_estilo_justificativa.md
```

## Como criar o agente no Volund OS

Siga estes passos para plugar o pacote em uma instância do Volund OS:

### 1. Criar o agente

No painel do Volund OS, crie um novo agente com:
- **Nome:** `Validador Aurora`
- **Modelo:** Claude Sonnet 4.6 (recomendado para qualidade de raciocínio nos 16 critérios) ou Claude Opus 4.7 (se houver budget para mais qualidade).
- **Tools habilitadas:** nenhuma (raciocínio puro sobre input).
- **Integrações (MCPs):** nenhuma.

### 2. Configurar o System Prompt

Copie o conteúdo de `system-prompt.md` integralmente para o campo de System Prompt do agente. Não edite — o prompt é autocontido e os schemas inline são parte do contrato.

### 3. Carregar a Base de Conhecimento

Faça upload dos arquivos da pasta `base-de-conhecimento/` na seção Base de Conhecimento do agente:

- `playbook-selecao-aurora.md`
- `tese-investimento-aurora.md`
- `schema-formulario-aurora.md`
- `mapeamento-criterios.md`
- `cortes-recomendacoes.md`
- `fronteiras-do-agente.md`

E também os schemas (para o agente referenciar o contrato):

- `schemas/input-schema.json`
- `schemas/output-schema.json`

### 4. Instalar a Skill

Copie a pasta `skills/processar-submissao-aurora/` para `.claude/skills/processar-submissao-aurora/` no projeto onde o agente vive. O hook PostToolUse fará o snapshot automaticamente.

### 5. (Opcional) Seedar memórias iniciais

Copie os arquivos da pasta `memory/` para `~/.claude/projects/<slug-do-projeto>/memory/`:

- `MEMORY.md` (índice)
- `project_aurora_context.md`
- `reference_playbook_selecao.md`
- `feedback_estilo_justificativa.md`

Isso pré-carrega o contexto Aurora para o agente em todas as sessões.

### 6. Adicionar exemplos como referência

Os arquivos em `exemplos/` podem ser carregados como contexto inicial em conversas com o agente, ou usados como conjunto de testes de regressão (ver seção "Como testar").

## Como invocar o agente

Envie um JSON de input conforme `schemas/input-schema.json`. Exemplo mínimo:

```json
{
  "submissao_aurora": {
    "founders": [...],
    "solucao": {...},
    "progresso": {...},
    "problema_mercado": {...},
    "expectativas": {...}
  },
  "hipotese_no_no": "Foco em MEIs do setor de alimentação, canal WhatsApp",
  "dossie_buscador": {
    "concorrentes_validados": [...],
    "concorrentes_omitidos_pelo_founder": [...],
    "tam_sam_som_validado": "...",
    "dores_confirmadas": [...],
    "tendencias": [...]
  }
}
```

O agente devolve JSON conforme `schemas/output-schema.json`. Não inclui narração ou comentários fora do JSON — só o output estruturado.

## Como testar

### Teste 1: Lint dos schemas

```bash
cd validador-aurora
npx ajv compile -s schemas/input-schema.json
npx ajv compile -s schemas/output-schema.json
```

Devem compilar sem erros.

### Teste 2: Sanity check dos exemplos

Cada exemplo em `exemplos/` contém input + output esperado. Para validação programática, extraia o JSON do input em arquivo separado e rode:

```bash
npx ajv validate -s schemas/input-schema.json -d exemplos/01.input.json
npx ajv validate -s schemas/output-schema.json -d exemplos/01.output.json
```

### Teste 3: Calibração end-to-end

1. Pegue o input do `exemplos/01-prioridade-legaltech-b2b.md`.
2. Invoque o agente no Volund OS.
3. Compare o output gerado com o esperado no exemplo.
4. **Critério de sucesso:**
   - `recomendacao_playbook` igual.
   - `score_parcial_fit` dentro de ±5 pontos.
   - Notas dos critérios dentro de ±1 ponto (modelo é variável; tolerar pequenas divergências).
   - `tags` igual ou subconjunto válido.
   - `veto` exato (sem tolerância).
5. Repita para exemplos 02 e 03.

### Teste 4: VETO

Use `exemplos/03-veto-regulatorio-saude.md`. Critério crítico:
- `veto: true` exato.
- `recomendacao_playbook = "descartar"` (sobrescreve score).
- Justificativa do critério 10 cita CFM, ANVISA RDC 657 ou precedente equivalente.

### Teste 5: Discrepâncias

Use `exemplos/02-validar-edtech-b2c.md`. Critério:
- `discrepancias_founder_vs_research` contém entrada de severidade "alta" em TAM.
- Contém entrada para concorrentes omitidos.

## Como atualizar regras

Quando o time Aurora atualiza o scorecard (mudança de pesos, rubricas, novo critério, etc.):

### Mudança de peso ou rubrica de critério existente

1. Editar `system-prompt.md` (tabela dos 16 critérios + rubrica universal).
2. Editar `base-de-conhecimento/playbook-selecao-aurora.md` (seção do critério afetado).
3. Validar contra os 3 exemplos — atualizar outputs esperados se as notas mudarem.
4. Versionar o pacote (commit + tag).

### Mudança nas faixas de recomendação

1. Editar `system-prompt.md` (seção "Faixas de recomendação").
2. Editar `base-de-conhecimento/cortes-recomendacoes.md`.
3. Revalidar exemplos.

### Adição de critério novo

1. Atualizar `schemas/output-schema.json` (enum do `id` no critério; aumentar `maxItems` do array).
2. Editar `system-prompt.md` (tabela + descrição).
3. Editar `base-de-conhecimento/playbook-selecao-aurora.md` (nova seção de critério).
4. Editar `base-de-conhecimento/mapeamento-criterios.md` (nova linha).
5. Atualizar os 3 exemplos com o novo critério.

### Mudança no formulário (raro)

1. Editar `schemas/input-schema.json`.
2. Editar `base-de-conhecimento/schema-formulario-aurora.md`.
3. Editar `base-de-conhecimento/mapeamento-criterios.md` se a fonte mudar.
4. Atualizar exemplos para refletir a nova estrutura do input.

## Dependências do agente no pipeline maior

O Validador Aurora **consome**:
- Output do **Orquestrador** (que produz `submissao_aurora` e `hipotese_no_no` por nó).
- Output do **Buscador** (que produz `dossie_buscador`).

O Validador Aurora **produz**:
- Output que alimenta o **score multivariável final** (dimensão "Fit estratégico").
- Tags que aparecem na UI da árvore de hipóteses.
- Recomendação que serve de input para o Orquestrador decidir expandir/refinar/podar.

Detalhes da integração no pipeline maior: ver documento de arquitetura no diretório pai (`Arquitetura - Autovalidador de Ideias.md`).

## Arquivos-fonte do projeto

Este pacote foi gerado a partir de:

- `../Solucao Consolidada.md` — visão consolidada do projeto.
- `../Arquitetura - Autovalidador de Ideias.md` — arquitetura técnica detalhada.
- `../VolundOS.md` — documentação da plataforma Volund OS.

## Versão

**Versão:** 1.0 (MVP do hackathon Beyond Agents)
**Data:** 23 mai 2026
**Status:** Pronto para criação no Volund OS
