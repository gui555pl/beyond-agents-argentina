# Tese de Investimento Aurora

> O que a Aurora explicitamente busca quando avalia uma hipótese. Documento usado pelo Validador para gerar **tags estruturadas** (não pesam no score, mas alimentam a leitura visual do nó).

## Propósito declarado

> *Produtos digitais que trazem conveniência para a vida das pessoas.*

Esse é o vetor norte. Tudo que se desvia disso recebe a tag `vertical-fora-da-tese` ou, no caso de modelos, alerta visual.

## Verticais priorizadas

A Aurora opera por padrão dentro destas quatro verticais — onde já tem canal, expertise institucional e parceiros:

| Vertical | Sigla | Sinais típicos |
|---|---|---|
| **LegalTech** | `legaltech` | Automação de processos jurídicos, contratos, contencioso, compliance. |
| **EdTech** | `edtech` | Educação corporativa, plataformas de aprendizagem, automação acadêmica. |
| **HealthTech** | `healthtech` | Operação clínica, gestão hospitalar, jornada do paciente (não-diagnóstico). |
| **GovTech** | `govtech` | Solução para órgãos públicos, automação de processos governamentais, transparência. |

Toda hipótese em uma dessas verticais recebe a tag `vertical-priorizada-{vertical}`. Hipóteses em outras verticais recebem `vertical-fora-da-tese`.

**Importante**: vertical "fora da tese" não significa veto. Recebe a tag para que o Comitê veja claramente, mas o score pode justificar exceção se os demais critérios forem fortes.

## Modelos de negócio preferidos

| Modelo | Tag | Status na tese |
|---|---|---|
| **B2B** | `modelo-b2b` | Preferido. Match natural com canal Aurora/Extreme. |
| **B2G** | `modelo-b2g` | Estratégico. Beyond tem canal público dedicado. |
| **B2C** | `modelo-b2c` | Aceito com alerta "fora da tese explícita". Exige defesa adicional dos demais critérios. |

## Estágios aceitos

| Estágio | Tag | Descrição |
|---|---|---|
| **Ideação** | `estagio-ideacao` | Hipótese ainda sem MVP. Foco do autovalidador. |
| **Validação** | `estagio-validacao` | MVP existe, busca product-market fit. |
| **Early-stage** | `estagio-early-stage` | Tração inicial validada, busca aceleração. |

Estágios posteriores (growth, scale-up) são escopo do Venture Studio, não da Aurora.

## Sinais de fit

Uma hipótese é classificada como **dentro da tese** quando:
1. Está em vertical priorizada, **ou**
2. Tem modelo B2B/B2G claro, **ou**
3. Há sinergia operacional explícita com portfólio Beyond, **ou**
4. Bate com o propósito "conveniência para pessoas" de forma evidente (recebe a tag `conveniencia-pessoas` como bônus).

**Dentro de tese** = pode receber `prioridade` no score final.
**Tangencial** = caminha bem se score for forte; vai a `validar` no típico.
**Fora de tese** = score precisa ser excepcional para ir além de `descartar`.

## Como o Validador usa este documento

1. Lê `formulario.solucao.vertical` → determina tag de vertical.
2. Infere modelo de negócio a partir de `formulario.problema_mercado.publico_problema_solucao` e `canais_de_venda` → determina `modelo-{b2b|b2g|b2c}`.
3. Infere estágio a partir de `formulario.progresso.tempo_de_trabalho` + `cash_balance_e_burn_rate` → determina `estagio-{ideacao|validacao|early-stage}`.
4. Avalia se a hipótese bate com "conveniência para pessoas" → adiciona `conveniencia-pessoas` se sim.
5. Anexa todas as tags no campo `tags` do output, sem mexer no score.

## O que não está nesta tese

Para evitar over-fitting do Validador a preferências circunstanciais:

- **Geografia**: a Aurora opera nacionalmente; região não é tag.
- **Estágio do founder**: idade, gênero, escolaridade NÃO são critérios de tese (entram no critério `perfil_founder`, não como tag).
- **Stack tecnológico**: não há preferência declarada por linguagem ou framework.
- **Tipo de investimento**: equity vs. SAFE vs. convertible é decisão posterior do Comitê.
