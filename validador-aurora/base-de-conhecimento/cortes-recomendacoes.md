# Cortes de Recomendação e Mecânica do VETO

> Regras de como o `score_parcial_fit` vira `recomendacao_playbook`, e como o VETO regulatório opera.

## Faixas de recomendação

| Score | Recomendação | Significado na governança Aurora |
|---|---|---|
| `< 60` | **descartar** | Não entra no funil. Vai para backlog passivo (pode ser revisitado se contexto mudar). |
| `60 – 80` | **validar** | Entra no funil como hipótese a aprofundar. Próxima fase: Vesting 1 (90 dias com LP, mídia paga, métricas reais). |
| `> 80` | **prioridade** | Fast-track. Recebe alocação de squad e recursos preferenciais. Comitê é chamado antes para confirmar. |

A recomendação é **calculada**, não inferida. O Validador:

1. Calcula `score_parcial_fit` pela fórmula em `playbook-selecao-aurora.md`.
2. Aplica a faixa.
3. Se VETO ativo, sobrescreve para `descartar`.

## Exibição na UI

No site da demo, a recomendação aparece como **badge no nó da árvore**:

| Recomendação | Badge | Cor |
|---|---|---|
| `descartar` | "Fora de tese" | Vermelho |
| `validar` | "Validar" | Amarelo |
| `prioridade` | "Prioridade Aurora" | Verde |
| `descartar` por VETO | "VETO Regulatório" | Vermelho escuro |

## Mecânica do VETO

### Quando aciona

VETO aciona quando o critério 10 (`risco_regulatorio`) recebe **nota 1**. Nota 1 é reservada para casos onde a barreira jurídica **inviabiliza o modelo** — não para regulação que apenas torna o modelo difícil.

Exemplos que justificam nota 1:

- HealthTech ofertando **diagnóstico médico via IA** sem registro ANVISA + sem médico no loop (proibido CFM Resolução 2.314/2022).
- Plataforma de **cassino online com apostas em dinheiro real** com público brasileiro sem licença Bets (Lei 14.790/2023).
- Fintech ofertando **crédito direto ao consumidor** sem licença BCB.
- Plataforma de **drone delivery** sem certificação ANAC, em rota urbana ativa.

Exemplos que **NÃO** justificam nota 1 (notas 2-4 são adequadas):

- LGPD aplicável (todo SaaS tem) → nota 6-8 dependendo da maturidade.
- Marketplace de saúde (não diagnóstico, agendamento) → nota 6-8.
- EdTech vendendo para escolas → nota 8-10 (regulação trivial).

### O que muda no output

Quando VETO aciona:

```json
{
  "veto": true,
  "criterios": [
    {
      "id": "risco_regulatorio",
      "nota": 1,
      "peso_normalizado": 7.1,
      "veto": true,
      "fonte": "...",
      "justificativa": "Barreira X que inviabiliza modelo Y conforme legislação Z..."
    },
    ...
  ],
  "score_parcial_fit": <ainda calculado normalmente>,
  "recomendacao_playbook": "descartar"
}
```

**Importante**: o `score_parcial_fit` continua sendo calculado para fins de relatório (mostra que, mesmo sem o veto, o quão forte era a ideia). Mas a `recomendacao_playbook` é sempre `descartar` quando `veto = true`.

### Por que VETO existe (e por que é único)

O VETO **não é uma terceira faixa de score** — é uma **exceção que respeita o caráter institucional do scorecard**. O Comitê Aurora não investe em modelos juridicamente inviáveis, ponto. Forçar o Validador a respeitar essa fronteira preserva o alinhamento com a governança.

Outros critérios fracos podem ser **compensados** por critérios fortes — uma ideia com TAM baixo mas moat enorme e founder excepcional pode valer a aposta. **Mas modelo proibido por lei não tem compensação possível.**

Por isso o VETO é o único override do score. Manter qualquer outro critério como veto destruiria a lógica multivariável.

## Casos de borda

### Score limítrofe (59-61, 79-81)

O Validador **não suaviza** — usa as faixas estritas. A leitura humana fica clara: se o Comitê discordar, o slider de pesos na UI (próximo dimensionamento) permite ajuste.

### VETO + score alto

Se uma ideia tem score 85 + VETO ativo, o output mostra os dois lados: relatório executivo destaca "Score alto, mas modelo inviável regulatoriamente". Comitê pode pivotar a ideia para um modelo legal.

### Score muito baixo sem VETO

Score `< 40` é estatisticamente raro (exige fraqueza em quase todos os critérios). Quando acontece, o relatório executivo diz "Não recomendado mesmo com pivots" — sinal para o Comitê não desperdiçar Vesting.
