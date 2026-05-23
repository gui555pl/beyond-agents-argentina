# Pitch — Material Bruto

> Banco de munição para montar o pitch do hackathon. Não é roteiro. Cada bloco é um pacote de material que o time pode pinçar e remixar.
>
> Atualizado a partir de [Solucao Consolidada.md](./Solucao%20Consolidada.md) e [Arquitetura - Autovalidador de Ideias.md](./Arquitetura%20-%20Autovalidador%20de%20Ideias.md).

---

## 1. Frases-âncora candidatas

Frases curtas que funcionam como hook de abertura, virada ou fechamento.

**O problema (descobrir > construir):**

- "Hoje, o mais difícil não é fazer a solução. É ter a ideia certa."
- "O gargalo deixou de ser construir. Virou descobrir."
- "Tudo começa com uma ideia. Mas só algumas merecem virar produto. A questão é: quais?"
- "Validar uma ideia hoje custa uma equipe. Amanhã, custa um prompt."

**A escala (Beyond como fábrica de startups):**

- "A Beyond nasceu para ser uma fábrica de startups. Hoje, valida no varejo."
- "Hoje a Aurora valida uma ideia por trimestre. Amanhã, dez por semana."
- "A gente não está acelerando o desenvolvimento. Está antecipando a decisão."

**A solução (em uma frase):**

- "Você digita uma ideia. A árvore cresce na tela. No final, você sabe se vale investir."
- "Uma ideia entra. Uma árvore de hipóteses cresce ao vivo. Um score sai — antes do primeiro real investido."
- "Cinquenta usuários sintéticos validando dez landing pages, em paralelo, em minutos."

**A maturidade (não substituímos ninguém):**

- "Não automatizamos o Comitê de Inovação. Aceleramos ele."
- "A decisão de investir continua sendo humana. Só que agora chega com dados de mercado, não com suposições."

## 2. Contraste antes vs depois — a inversão de lógica

Estrutura clássica para montar a narrativa: como é hoje × como passa a ser. Saiu praticamente pronto da fala do Guedes.

**Antes (mundo atual):**

- A gente gasta tempo fazendo código e fazendo produto, para depois comercializar.
- A capacidade de testar ideias por trimestre é limitada pelo tamanho do time.
- Cada hipótese consome pessoas, semanas, ciclos de 90 dias.
- A decisão de investir vem antes de saber se existe mercado.

**Depois (com o autovalidador):**

- A gente inverte a lógica: valida o produto primeiro, que nem existe ainda, e depois decide se quer fazer.
- 10 hipóteses rodam **em paralelo**, no tempo em que hoje a Aurora valida uma.
- O sistema gera LP real, gera anúncios reais, **expõe a 50–200 usuários sintéticos** e devolve um score.
- O custo de "errar" cai a ponto de errar virar parte saudável do processo.
- A decisão de investir chega ao Comitê com **sinal de mercado**, não com pitch deck de founder.

**Citação para usar quase verbatim (Guedes):**

> "A gente precisa inverter a lógica: validar o produto primeiro, que nem existe ainda, e depois decidir se a gente quer ou não fazer."

## 3. Prova de dor real — o caso ZELA

Sempre que possível, ancorar o problema em um caso concreto interno. Tira o pitch do abstrato.

- A Beyond acabou de fechar um investimento de **mais de R$ 1MM na ZELA**.
- A validação que sustentou esse investimento foi **apenas o material que veio da própria ZELA** — pitch deck, projeções, conversa com founders.
- Não houve teste de mercado independente antes da assinatura do contrato.
- Pergunta retórica para o palco: "**Se antes de fechar o contrato com a ZELA a gente tivesse rodado a ideia deles dentro do nosso pipeline — gerado dez LPs, expostas a centenas de usuários sintéticos —, que decisão teríamos tomado?**"
- Não é crítica à ZELA — é o reconhecimento de que **toda decisão de investimento da Beyond hoje opera no escuro até o D90**.

Citação relacionada (Guedes):

> "A gente fez um investimento agora na ZELA que vai atualizar um pouco mais de 1 milhão de reais, mas ao fazer esse investimento a gente usou como validação apenas o que veio da própria ZELA."

## 4. Posicionamento da solução em uma frase

Para o slide-síntese ou o final do pitch. Variações para escolher tom:

**Versão técnica:**
> Um pipeline agêntico em padrão Orchestrator-Workers que recebe uma ideia em texto, monta uma árvore de hipóteses, gera LP + anúncios reais por nó, expõe cada LP a um swarm de personas sintéticas (Miro Fish), e devolve um score multivariável — tudo visualizado ao vivo.

**Versão business:**
> A primeira esteira de validação de mercado da Beyond que não consome o tempo do time.

**Versão visão:**
> Uma máquina de descobrir o que vai virar produto antes de a gente decidir construí-lo.

**Versão Beyond/Aurora interna:**
> Os 90 dias da Aurora, comprimidos em minutos. Sem usar a Volund. Sem queimar pessoas. Sem assinar MoU antes da hora.

**Versão demo-first:**
> Você digita uma ideia. A árvore cresce ao vivo na tela. Cada nó é uma hipótese com LP no ar e 200 usuários sintéticos validando. No final, três finalistas e um relatório de uma página para o Comitê.

## 5. Hooks de impacto (Guedes, quase verbatim)

Frases do próprio Guedes que podem ir para o palco com mínimo retoque. São fortes porque vêm de um mentor que **endossa** a tese.

- "Vocês criaram um validador de ideias em escala. Vocês precisam ver o custo: se a gente pudesse testar 10 ideias ao mesmo tempo, a gente realmente transforma a Beyond na fábrica de startups que ela nasceu para ser."
- "Nós, enquanto Beyond, temos o propósito de ser uma startup de startups. No entanto, nos últimos anos, a gente só conseguiu lançar tantos produtos. Isso acontece porque a gente gasta muito tempo fazendo código antes de comercializar."
- "A gente criou uma unidade para fazer isso [a Aurora], mas ainda assim a nossa capacidade de testar ideias nessa unidade é muito pequena, porque a gente tem um custo atrelado a esse teste — inclusive um custo de pessoas."
- "Se a gente não tivesse que usar tantas pessoas para testar no momento inicial, a gente poderia testar talvez 10 hipóteses ao mesmo tempo."

## 6. Demo sugerida — o site é o produto

A recomendação direta do Guedes foi: **mostre funcionando**. Pitch agêntico vence por demo, não por slide. E, no nosso caso, **a demo é o produto**: um site dedicado onde toda a exploração acontece ao vivo na frente da banca.

Sequência sugerida (3–5 minutos):

1. **Tela 1 — Input ao vivo.** Alguém do time digita no palco uma frase de ideia (idealmente uma ideia plausível de funil Aurora). Clica "Validar".
2. **Tela 2 — A árvore cresce na tela.** O Orquestrador-Agente expande a ideia raiz em sub-hipóteses. Cada nó aparece na árvore como um card que muda de cor conforme o estado: **cinza pulsando** (gerando) → **azul** (LP deployada) → **animação** (Miro Fish rodando) → **verde** (aprovada) / **laranja** (refinando) / **cinza riscado** (podada). Isso acontece em paralelo, em vários nós ao mesmo tempo. **É a parte visualmente mais forte do pitch.**
3. **Tela 3 — Painel lateral de um nó.** Clica em um nó qualquer da árvore. Abre painel mostrando:
   - A **LP renderizada num iframe** (URL Vercel real, qualquer um pode abrir em outra aba).
   - Os **3 anúncios gerados** como cards, com badge "Pronto para publicação — próxima fase".
   - O **feed do swarm** rodando: "Persona #47, 28 anos, gerente de operações: *'achei interessante, mas não entendi o preço'*. Não converteu." — linhas chegando em tempo real.
   - **Métricas atualizando**: conversão proxy, intenção de compra, % "muito decepcionado" sem o produto.
4. **Tela 4 — Resultado final.** Quando a árvore estabiliza:
   - **Top 3 hipóteses ranqueadas** pelo score multivariável.
   - **Sliders** para o avaliador ajustar os pesos (quanti / quali / econ / fit) e ver o ranking mudar ao vivo — visualmente prova que **não é caixa-preta**.
   - **Relatório executivo de 1 página** pronto para o Comitê Aurora.
   - **Custo total** da exploração (tokens + tempo).

Citação que enquadra a demo (Guedes):

> "Mostrar funcionando e mostrar os anúncios que vocês criaram — você dando um input de uma ideia, ele extrapolando para um produto maior, você fazendo todo o planning ali."

## 7. Métricas de impacto para fechar o pitch

Números são o que transforma uma boa demo em pedido de investimento. Servem para dimensionar o salto: a comparação **não é tempo×tempo**, é **ordens de grandeza**.

| Métrica | Hoje (Aurora) | MVP do hackathon | Próxima fase (v2) |
| --- | --- | --- | --- |
| Custo de validação por hipótese | Pessoas + semanas + verba | **~$0.10–0.20 em tokens** | **~R$ 500 em mídia paga real** |
| Hipóteses simultâneas | 1–2 por trimestre | **10+ em paralelo** | **dezenas** |
| Tempo até primeiro sinal go/no-go | 90 dias do Vesting 1 | **Minutos a horas** | **Dias** |
| Como mede mercado | LP + mídia paga manual + 90 dias | **Swarm sintético (Miro Fish)** | **Swarm + mídia paga real** |
| Decisão de investimento | Baseada no que o founder traz | Baseada em **score multivariável** | Baseada em **mercado real + sintético** |
| Ideias mortas antes de virar OPEX | Poucas | **Maioria** — falha barato | **Maioria** — falha mais barato |

Frase de fechamento construída a partir disso:

> "Hoje, a Aurora testa uma ideia por trimestre por iniciativa. Com o que está nesta tela, ela testa dez em paralelo em minutos. Isso não é otimização de processo. É mudar a escala do que a Beyond consegue ser."

## 8. Diferenciais técnicos que vendem maturidade

Não são o foco do pitch, mas viram munição para arguição ou para diferenciar do que outros times do hackathon vão entregar.

- **"Orchestrator-Workers, não swarm colaborativo."** Escolhemos um orquestrador-agente que coordena workers especialistas, em vez de N agentes conversando entre si. Workers não falam entre si. Resultado: **auditável**, **demonstrável**, sem bouncing infinito. Mostrar que o time sabe a diferença vende.
- **"Caps determinísticos como envelope, decisão agêntica dentro."** Profundidade da árvore, fan-out, orçamento por nó e timeout são limites duros. Mas o que **decidir** dentro do envelope (expandir, refinar, podar) é raciocínio do LLM. Combina o melhor dos dois mundos — foge do antipadrão "agente faz tudo".
- **"Criador é um agente único com múltiplas habilidades."** LP, anúncios, copy e roteiro saem do mesmo agente, em vez de um agente por artefato. Isso garante que a LP e os anúncios de uma mesma hipótese **falem a mesma língua** — algo que enxames colaborativos falham em garantir.
- **"Miro Fish não é inspiração — é o mecanismo de leitura de mercado."** O swarm de 50–200 personas sintéticas substitui mídia paga real **no MVP**, e **soma-se** a ela na v2. Não é uma muleta, é uma camada nova e mais barata de pré-validação.
- **"Anúncios gerados, não publicados — próxima fase."** Honestidade sobre o escopo do hackathon. Os assets saem prontos para publicação; a integração com Meta Ads está mapeada e estimada para a v2.
- **"~$0.10–0.20 por hipótese, em tokens."** Número claro de ROI para o júri. Compare com pessoas + semanas hoje.
- **"Validador calibrado nas métricas reais da Aurora."** Não inventamos critério. Usamos o scorecard que a Aurora já aplica hoje. O output da nossa pipeline **fala a mesma língua do Comitê de Inovação**.
- **"Stack TypeScript ponta a ponta."** Mastra/Vercel AI SDK + Next.js + React Flow + Socket.io + Vercel. Um único repositório, um único deploy, streaming nativo do orquestrador para a UI.

## 9. O que ficou fora deliberadamente (e por quê)

Frame poderoso para o pitch: **mostrar o que cortamos é prova de maturidade**. Em vez de prometer demais, listamos o que cabe na v2 e dizemos por que cortar agora foi a decisão certa.

Cada um destes vira uma frase no pitch:

- **Publicação real de anúncios em Meta/Google.** Cortamos porque a janela mínima de coleta e a aprovação dos canais comeriam o tempo do hackathon. Os assets saem prontos, integração mapeada. *"V2 publica."*
- **Agente de Tendências contínuo em background.** Na demo, snapshot pré-coletado alimenta o Criador. Mesma arquitetura, só rolando offline. *"V2 coleta tendências em tempo real."*
- **Loop de refinamento profundo.** Limitamos a 1 refinamento por nó para a árvore caber em tempo apresentável. *"V2 refina até convergir."*
- **Persistência cross-execução.** Estado em-process por enquanto. *"V2 persiste em Redis e permite reabrir runs antigos."*
- **Avaliação de performance dos próprios anúncios.** Hoje só medimos LP via swarm. *"V2 estende swarm para criativos."*

Frase candidata a abrir esta parte do pitch:

> "Isso é o MVP. Vou ser direto sobre o que **não** está aqui."

## 10. Glossário rápido

Para uso interno do time durante a montagem do pitch — e útil se a banca não for 100% Beyond.

- **Beyond** — venture builder do Extreme Group; "startup de startups". Em algumas falas aparece como "Biondi" (erro de transcrição). É a mesma coisa.
- **Aurora** — Business Unit dentro da Beyond responsável pela fase inicial da venture builder: pega hipótese de negócio e valida até o handover para o Venture Studio.
- **Volund** — squad agêntica de desenvolvimento. Constrói o produto após a Aurora validar.
- **Venture Studio** — time que recebe a iniciativa da Aurora após validação e cuida do ciclo de escala (do mês 4 em diante).
- **Vesting** — modelo de acompanhamento de 4 anos da Aurora, dividido em quatro vestings com KPIs próprios. Vesting 1 = primeiros 90 dias, 100% dedicados à validação.
- **MoU** — Memorando de Entendimento. Contrato assinado entre Beyond e founders no início do ciclo Aurora.
- **Scorecard** — instrumento da Fase 1 do Playbook de Seleção. Tem perguntas gerais (60% do peso) e específicas por fonte de oportunidade (40%). Decide se uma oportunidade entra no funil.
- **Sean Ellis** — métrica qualitativa de validação. Se > 40% dos usuários ficariam "muito decepcionados" sem a solução, é um sinal forte de product-market fit.
- **Orchestrator-Workers** — padrão arquitetural onde um agente orquestrador coordena agentes workers especialistas. Workers não falam entre si — toda comunicação passa pelo orquestrador. Oposto de swarm colaborativo.
- **Miro Fish** — ferramenta open source de simulação multi-agente (criada em 10 dias por um engenheiro chinês, usada originalmente para simulação política). **No nosso pipeline, é o mecanismo central de leitura de mercado**: 50–200 personas sintéticas analisam cada LP e devolvem métricas comparáveis a uma exposição real.
- **Swarm sintético** — pool de personas geradas por LLM que respondem como usuários reais à LP. Não é A/B test estatístico clássico — é um sinal **qualificado** e **rápido** de fit.
