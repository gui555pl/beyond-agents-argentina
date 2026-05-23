---
name: Processar Submissão Aurora
description: Roteiro completo de avaliação de uma hipótese contra o scorecard Aurora — do input ao JSON de output validado. Aplica os 16 critérios, detecta VETO regulatório, gera tags da tese, calcula score ponderado e identifica discrepâncias founder vs research.
time_saved_minutes: 240
---

## Visão Geral

Esta skill é o **roteiro operacional mestre** do Validador Aurora. Operacionaliza o algoritmo descrito no system prompt em passos sequenciais auditáveis.

**Quando usar:** sempre que o Orquestrador despachar um nó da árvore de hipóteses para o Validador Aurora.

**Pré-requisitos:**
- Input válido conforme `schemas/input-schema.json` (formulário Aurora + hipótese + dossiê do Buscador).
- Base de conhecimento carregada: `playbook-selecao-aurora.md`, `tese-investimento-aurora.md`, `mapeamento-criterios.md`, `cortes-recomendacoes.md`.

## Passo-a-Passo

### 1. Validar input

Confira que o JSON recebido contém os 3 campos obrigatórios:
- `submissao_aurora` (com os 5 blocos: founders, solucao, progresso, problema_mercado, expectativas).
- `hipotese_no_no` (string).
- `dossie_buscador` (com os 5 campos do schema).

Se inválido, devolva erro estruturado:
```json
{ "erro": "input_invalido", "campos_faltantes": ["..."] }
```

### 2. Carregar contexto institucional

Antes de avaliar, releia mentalmente:
- Os 16 critérios e seus pesos normalizados (tabela no system prompt).
- A rubrica universal de notas (1-10).
- A lista de tags e regras de inferência.
- A mecânica do VETO.

Se houver dúvida sobre rubrica de um critério específico, consulte `base-de-conhecimento/playbook-selecao-aurora.md` na seção do critério.

### 3. Avaliar os 16 critérios

Para cada critério, na ordem da tabela:

**a. Identificar fonte:**
- Localize o campo-fonte primária em `submissao_aurora` (ver `mapeamento-criterios.md`).
- Se primária ausente ou ambígua, consulte fonte secundária.
- Se ambas ausentes, nota = 4 com justificativa de ausência.

**b. Cruzar com dossiê:**
- Para critérios 1, 3, 4, 10 (e onde aplicável): compare o que o founder afirmou com o que o Buscador validou.
- A divergência influencia a nota **dentro da rubrica** (ex.: founder afirma TAM gigante, Buscador desmente → nota mais baixa em `tam_sam_som`).

**c. Aplicar rubrica:**
- Escolha a nota inteira (1-10) que melhor casa com a faixa da rubrica do critério.
- Nota 1 só para VETO regulatório (critério 10) ou ausência total.

**d. Escrever justificativa:**
- 1-2 frases.
- Cite explicitamente o caminho do campo: `"formulario.<bloco>.<campo>"`.
- Sem hedge ("acho que", "talvez").
- Tom de avaliador do Comitê.

**e. Registrar no array `criterios`:**
```json
{
  "id": "<id_do_criterio>",
  "nota": <1-10>,
  "peso_normalizado": <valor_da_tabela>,
  "fonte": "formulario.<caminho> [+ dossie.<caminho>]",
  "justificativa": "<texto curto>"
}
```

### 4. Checar VETO

Se o critério 10 (`risco_regulatorio`) recebeu **nota 1**:
- Adicione `"veto": true` ao objeto do critério.
- Marque `"veto": true` no root do output.

Use a lógica detalhada de quando nota 1 é justificável (`base-de-conhecimento/cortes-recomendacoes.md`, seção "Mecânica do VETO"):
- Justifica nota 1: barreira que **inviabiliza** o modelo (diagnóstico médico sem ANVISA, cassino sem licença Bets, crédito sem BCB...).
- Não justifica nota 1: regulação que apenas dificulta (LGPD comum, setor regulado mas viável).

### 5. Calcular `score_parcial_fit`

```
score = Σ(nota_i × peso_normalizado_i) / 10
```

Para os 16 critérios. Pesos 15 e 16 são 0 (deduplicação) — não afetam soma.

Resultado deve ser número entre 0 e 100.

### 6. Gerar tags da tese

Aplique as regras da tabela de tags:

- **Vertical:**
  - `solucao.vertical = legaltech` → `vertical-priorizada-legaltech`
  - `solucao.vertical = edtech` → `vertical-priorizada-edtech`
  - `solucao.vertical = healthtech` → `vertical-priorizada-healthtech`
  - `solucao.vertical = govtech` → `vertical-priorizada-govtech`
  - `solucao.vertical = outra` → `vertical-fora-da-tese`

- **Modelo:** infira de `problema_mercado.publico_problema_solucao` + `canais_de_venda`:
  - Cliente é empresa privada → `modelo-b2b`
  - Cliente é órgão público → `modelo-b2g`
  - Cliente é pessoa física → `modelo-b2c`

- **Estágio:** infira de `progresso.tempo_de_trabalho` + `cash_balance_e_burn_rate`:
  - Sem MVP, ideação pura → `estagio-ideacao`
  - MVP em validação → `estagio-validacao`
  - Tração inicial confirmada → `estagio-early-stage`

- **Propósito:** se a ideia bate com "produtos digitais que trazem conveniência para a vida das pessoas" → adicionar `conveniencia-pessoas`.

Anexe tags no array `tags`.

### 7. Detectar discrepâncias

Percorra a heurística de discrepâncias (tabela no system prompt):

Para cada par formulário ↔ dossiê:

- **TAM/SAM/SOM**: compare `problema_mercado.tam_sam_som` com `dossie.tam_sam_som_validado`. Severidade conforme proporção da divergência.
- **Concorrentes**: compare a lista do founder em `problema_mercado.concorrentes_e_lacunas` com `dossie.concorrentes_omitidos_pelo_founder`. Severidade conforme quantidade.
- **Dor latente**: compare `problema_mercado.dor_latente_e_evidencias` com `dossie.dores_confirmadas`. Se dossiê desmente → alta.
- **Barreira regulatória**: compare `problema_mercado.barreira_legal_imediata` com `dossie.auto_research_juridico`. Mismatch = alta.
- **Moat**: compare `problema_mercado.diferencial_moat` com lista de concorrentes do dossiê. Se claim "único" + 5 concorrentes idênticos → alta.

Cada divergência relevante vira:
```json
{
  "campo": "problema_mercado.<campo>",
  "founder": "<o que ele declarou>",
  "research": "<o que o dossiê encontrou>",
  "severidade": "baixa" | "media" | "alta"
}
```

### 8. Determinar `recomendacao_playbook`

```
if veto: recomendacao = "descartar"
elif score < 60: recomendacao = "descartar"
elif score <= 80: recomendacao = "validar"
else: recomendacao = "prioridade"
```

### 9. Montar e emitir JSON

Estruture o output conforme `schemas/output-schema.json`. Confirme:
- `criterios` tem exatamente 16 itens, na ordem da tabela.
- Pesos somam exatamente 100 (excluindo zeros de dedup).
- Todos os critérios têm `fonte` não-vazia.
- Todas as justificativas citam campo do formulário ou do dossiê.
- `tags` tem pelo menos `vertical-*`, `modelo-*`, `estagio-*`.
- `recomendacao_playbook` está consistente com `score_parcial_fit` (a menos que VETO ative).

### 10. Devolver

Emita o JSON. Não inclua comentários, narração ou explicações fora do JSON — o Orquestrador consome só o output estruturado.

## Casos de borda

- **Score 59.9 ou 80.1**: respeite as faixas estritas. Não suavize.
- **Founder com múltiplos founders**: avalie `perfil_founder` pelo founder mais forte do array. Justifique citando qual founder pesou.
- **Vertical "outra"**: critério 2 cai naturalmente para nota baixa; tag `vertical-fora-da-tese`. Demais critérios rodam normalmente.
- **Dossiê do Buscador vazio ou ausente**: avalie só com formulário. Justificativas devem citar "Sem validação do Buscador disponível." Notas dependentes de cross-check tendem a cair 1-2 pontos.

## Exemplos calibrados

Antes de rodar a skill em produção, leia os 3 exemplos em `exemplos/`:
- `01-prioridade-legaltech-b2b.md` — caso forte.
- `02-validar-edtech-b2c.md` — caso intermediário com discrepâncias.
- `03-veto-regulatorio-saude.md` — VETO acionado.

Eles servem de gabarito de tom e de formato.
