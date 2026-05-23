# Mapeamento Campo do Formulário ↔ Critério do Scorecard

> Tabela canônica que mapeia, para cada um dos 16 critérios, qual campo do formulário Aurora é a **fonte primária** e qual é a **fonte secundária**. Toda nota emitida pelo Validador deve citar o campo correspondente no `fonte` do output.

## Tabela definitiva

| # | Critério (id) | Fonte primária | Fonte secundária |
|---|---|---|---|
| 1 | `moat` | `problema_mercado.diferencial_moat` | `progresso.stack_tecnologico`; `founders[*].historico_trabalho` |
| 2 | `alinhamento_tese` | `solucao.vertical` | `solucao.por_que_escolheu`; `problema_mercado.publico_problema_solucao` |
| 3 | `problema_real` | `problema_mercado.dor_latente_e_evidencias` | `solucao.por_que_escolheu`; `dossie.dores_confirmadas` |
| 4 | `tam_sam_som` | `problema_mercado.tam_sam_som` | `dossie.tam_sam_som_validado` |
| 5 | `escalabilidade_tecnologica` | `problema_mercado.escalabilidade_sem_custo_proporcional` | `progresso.stack_tecnologico` |
| 6 | `escalabilidade_publica_b2g` | `solucao.vertical` | `expectativas.areas_de_ajuda` (contatos B2G) |
| 7 | `infra_beyond` | `progresso.reduz_custos_com_infra_beyond` (booleano) | — |
| 8 | `velocidade_mvp` | `progresso.mvp_em_4_semanas` | `progresso.stack_tecnologico` |
| 9 | `pesquisa_vs_vibe_coding` | `progresso.stack_tecnologico` | inferência do Validador sobre complexidade |
| 10 | `risco_regulatorio` (**VETO**) | `problema_mercado.barreira_legal_imediata` (booleano) | `dossie.auto_research_juridico` |
| 11 | `conhecimento_interno` | `progresso.stack_tecnologico` | comparação com portfólio Beyond/Aurora |
| 12 | `processo_comercial` | `problema_mercado.canais_de_venda` | `founders[*].historico_trabalho`; `founders[*].linkedin` |
| 13 | `perfil_founder` | Bloco completo `founders[*]` (Educação + Histórico + LinkedIn + Conquistas) | auto-research em redes (se disponível no dossiê) |
| 14 | `dono_da_briga` | `progresso.tempo_de_trabalho` | `expectativas.convencimento` |
| 15 | `sinergia_operacional_cac` | `progresso.reduz_custos_com_infra_beyond` (mesmo do critério 7) | — |
| 16 | `canais_de_venda` | `problema_mercado.canais_de_venda` (mesmo do critério 12) | `founders[*].historico_trabalho` |

## Convenção de notação no campo `fonte`

No output JSON, o campo `fonte` de cada critério deve ser uma string concisa que cite o caminho do campo. Exemplos válidos:

- `"formulario.solucao.vertical = legaltech"`
- `"formulario.problema_mercado.tam_sam_som + dossie.tam_sam_som_validado"`
- `"formulario.founders[0].historico_trabalho + linkedin"`
- `"formulario.progresso.reduz_custos_com_infra_beyond = true"`

Quando há discordância entre formulário e dossiê, a notação deve evidenciar:

- `"formulario.problema_mercado.barreira_legal_imediata = false (founder) + dossie.auto_research_juridico = barreira ativa (research)"`

## Regra para campos ausentes

Se um campo-fonte estiver vazio no formulário:

1. Tentar usar a **fonte secundária**.
2. Se também ausente, atribuir nota **4** com justificativa explícita: `"Campo X ausente no formulário; sem evidência secundária. Nota neutra com risco de subestimação."`
3. **Nunca inventar** evidência. Ausência é dado.

## Regra para correlação 7&15 e 12&16

Os pares (7, 15) e (12, 16) usam a mesma fonte primária. Para evitar dupla contagem no score:

- Critérios 15 e 16 recebem nota igual a 7 e 12 respectivamente, mas com `peso_normalizado: 0` no output.
- A nota ainda aparece como informação qualitativa para o Comitê.

Detalhamento da deduplicação em `playbook-selecao-aurora.md` (seção "Reescalonamento de pesos").
