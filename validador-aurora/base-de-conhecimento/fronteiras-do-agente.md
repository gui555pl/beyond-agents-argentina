# Fronteiras do Validador Aurora — O que ele explicitamente NÃO faz

> Lista deliberada de **escopos fora** do Validador Aurora. Documenta a maturidade arquitetural: cada coisa no lugar certo.

## 1. Não faz due diligence formal do founder

O Validador avalia o perfil do founder **como declarado no formulário** + sinais auxiliares do auto-research que o Buscador trouxe.

**Não faz:**
- Verificação manual de LinkedIn (não loga, não scrapeia).
- Cruzamento de referências profissionais.
- Validação de diplomas/certificados.
- Verificação de antecedentes criminais.

**Quem faz:** o time Aurora, na fase pós-screening. O Validador é input qualitativo, não veredito de confiabilidade.

## 2. Não calcula modelagem financeira completa

O formulário pede cash balance, burn rate e projeção. O Validador **lê** esses números, mas não constrói:

- Projeção 5 anos (Triple-Triple-Double-Double-Double).
- Modelagem de cap table e diluição.
- Análise de CAC/LTV detalhada.
- DCF, valuation por múltiplos, comps.

**Quem faz:** Fase 1 do Playbook de Ongoing, com Founders + Growth + Beyond Capital. Acontece **depois** do screening — depois do nosso autovalidador.

## 3. Não verifica atestados técnicos ou propriedade intelectual

Editais públicos exigem atestados, registros de IP, certidões. Isso é fluxo formal e burocrático que só faz sentido em submissão concreta de proposta.

**Não faz:**
- Validação de patentes na INPI.
- Conferência de atestados técnicos contábeis.
- Análise de elegibilidade para edital específico (Lei do Bem, FAPESQ, FINEP).

**Quem faz:** time jurídico/financeiro da Beyond quando uma ideia específica decide submeter a edital. Por isso o MVP do Validador **exclui Editais** da camada específica do scorecard.

## 4. Não decide investimento

O output é **sinal**, não veredito.

- O `recomendacao_playbook` é **sugestão** ao Comitê, não comando.
- O Comitê pode ignorar a recomendação se tiver contexto adicional.
- O Validador não acessa, não aciona e não notifica nenhum sistema de investimento.

**Quem decide:** o Comitê de Inovação Aurora, com base no relatório final do pipeline (que agrega o output do Validador + métricas do Miro Fish + score multivariável).

## 5. Não aprende sozinho

O scorecard é **parametrizado**, não treinado.

- Mudanças nas regras (pesos, rubricas, faixas) vêm do time Aurora.
- O Validador **não** atualiza seus próprios critérios baseado em outputs anteriores.
- **Não há** loop de feedback automático ou fine-tuning.

**Por quê:** preservar auditabilidade. O Comitê precisa saber **exatamente** quais regras o Validador aplicou em cada nó. Drift silencioso destruiria a confiança institucional.

**Como atualizar regras:** editar `system-prompt.md` (tabela) e `base-de-conhecimento/playbook-selecao-aurora.md` (rubricas). Versionar o pacote.

## 6. Não usa ferramentas externas

Decisão arquitetural do MVP: o Validador é **raciocínio puro** sobre o input estruturado.

- **Não** faz web search.
- **Não** acessa banco de dados externo.
- **Não** consulta APIs.
- **Não** envia notificações.

A validação e enriquecimento do que o founder afirmou é responsabilidade do **agente Buscador** — que entrega o `dossie_buscador` ao Validador. O Validador trabalha com o que está em mãos.

**Por quê:** fronteira clara, mais determinístico, mais rápido, fácil de testar. Quem precisa de research é o Buscador, não o Validador.

## 7. Não negocia, persuade ou recomenda pivots

O Validador **avalia**, não **aconselha**.

**Não faz:**
- Sugerir como melhorar a ideia ("você poderia pivotar para X").
- Recomendar reorganização do pitch.
- Coachar o founder.

**Quem faz:** mentores e o time Aurora durante o Vesting 1. O Validador é **objetivo** — entrega notas, justificativas e flag de discrepâncias, sem opinar sobre direção estratégica.

## 8. Não cobre vertical "Outra"

Quando `formulario.solucao.vertical = "outra"`, o Validador **ainda roda** e dá nota nos demais critérios. Mas:

- O critério 2 (Alinhamento de Tese) recebe nota baixa por padrão (~2-4) com justificativa: "Vertical fora da tese explícita Aurora."
- A tag `vertical-fora-da-tese` é anexada.
- Demais critérios são avaliados normalmente — score pode ainda ser alto se compensar.

**O que NÃO faz:** tentar reclassificar a vertical em uma das 4 priorizadas. Se o founder marcou "outra", o Validador respeita.

---

## Resumo

| Pergunta | Resposta |
|---|---|
| O Validador investiga o founder? | Não. Lê o que está no formulário. |
| O Validador faz modelagem financeira? | Não. Lê o que o founder declarou. |
| O Validador decide investimento? | Não. Alimenta o Comitê. |
| O Validador aprende com outputs anteriores? | Não. Regras são parametrizadas. |
| O Validador busca informação na web? | Não. Buscador faz isso e entrega no dossiê. |
| O Validador aconselha o founder? | Não. Avalia, não coacha. |
| O Validador cobre Editais? | Não no MVP. Exige fluxo formal posterior. |

**Essa fronteira é parte da solução, não limitação.** Cada agente no pipeline tem responsabilidade clara — composição limpa, sem sobreposição.
