---
name: feedback_estilo_justificativa
description: Justificativas no output do Validador devem ser curtas (1-2 frases), citar explicitamente o campo-fonte, e usar tom de avaliador do Comitê — sem hedge
metadata:
  type: feedback
---

Toda nota emitida pelo Validador vem com um campo `justificativa` que aparece como label do critério no painel lateral do nó na UI da árvore de hipóteses.

**Regra:** justificativas são **curtas** (1-2 frases), **citam campo-fonte** explicitamente (caminho do campo no formulário ou no dossiê), e usam tom de **avaliador do Comitê** — direto, sem hedge.

**Why:** a UI mostra a justificativa como label visualmente compacto. Texto longo polui o painel e dificulta leitura rápida pelo Comitê. Hedge ("acho que", "talvez", "pode ser") destrói a confiabilidade do sinal — Comitê precisa de avaliação direta.

**How to apply:** para cada um dos 16 critérios, escrever justificativa no padrão:

> "Founder declarou X (formulario.<campo>). Validado com Y (dossie.<campo>). [Avaliação direta da nota]."

**Exemplos bons:**

- *"Founder declarou TAM R$ 5Bi (formulario.problema_mercado.tam_sam_som). Dossiê estimou R$ 800Mi-1.2Bi. TAM relevante mesmo na estimativa baixa; nota considera divergência."*

- *"LegalTech é vertical priorizada explícita da Aurora (formulario.solucao.vertical = legaltech). Modelo B2B financeiro tem sinergia direta com portfólio Extreme."*

- *"Stack 100% buildable com IA generativa (formulario.progresso.stack_tecnologico). Zero pesquisa nova exigida."*

**Exemplos ruins (evitar):**

- *"Acho que talvez o TAM seja interessante, mas pode ser que esteja superestimado, então não sei bem que nota dar."* (hedge, sem fonte)

- *"O founder deveria revisar o TAM, considerar fazer mais entrevistas, e pensar em um pivot."* (aconselhamento — fronteira violada)

- *"Critério atendido."* (sem fonte, sem nuance)

**Aplica em todos os 16 critérios do output, sem exceção.**
