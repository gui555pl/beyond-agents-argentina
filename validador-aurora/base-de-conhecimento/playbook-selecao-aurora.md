# Playbook de Seleção Aurora — Scorecard e Rubricas

> Resumo institucional do scorecard que o Comitê de Inovação Aurora aplica hoje na Fase 1 (Screening). Este documento é a **fonte de verdade das regras de avaliação** do Validador Aurora.

## Contexto

A Fase 1 do funil Aurora é o **Screening**: antes de qualquer investimento (cash, infra ou tempo de squad), uma oportunidade passa por um filtro que avalia se ela merece entrar no funil de validação propriamente dito.

O Comitê aplica esse scorecard hoje manualmente. O Validador Aurora **automatiza esse trabalho** mantendo a fidelidade aos critérios — não o substitui na decisão final.

**Importante:** o scorecard original do Playbook tem três camadas:

- **Geral** (60% do peso) — vale para qualquer fonte de oportunidade.
- **Específico por fonte** (40%) — varia conforme a oportunidade tenha vindo de Editais, Mercado/Inorgânico ou Interno.

No MVP do autovalidador, **Editais fica fora de escopo** (exige propriedade intelectual, atestados técnicos, fluxo burocrático que só faz sentido em submissão de proposta concreta). Restam **12 gerais + 4 específicos de Mercado/Inorgânico/Interno = 16 critérios aplicáveis**.

O peso é reescalonado: ~83% original (60 + 20) → normalizado para 100.

## Rubrica universal de notas

Cada critério recebe **nota inteira de 1 a 10**:

| Faixa | Significado geral |
|---|---|
| **10** | Caso paradigmático de excelência — o critério está plenamente atendido com evidência forte. |
| **8-9** | Forte com nuance — bem atendido, mas com uma ressalva visível. |
| **6-7** | Bom — atende, faltam sinais conclusivos. |
| **4-5** | Ambíguo — sinais mistos, precisa de validação adicional. |
| **2-3** | Fraco — claramente deficitário. |
| **1** | Crítico — reservado para critério 10 (VETO regulatório) ou ausência total de evidência em campo obrigatório. |

Sempre que a evidência for **ausente** no formulário e o dossiê não cobrir, a nota cai para 4 com justificativa explícita citando a ausência.

---

## Camada 1 — 12 critérios gerais

### 1. Diferencial Injusto / Moat — peso original 10%

**Pergunta:** A ideia tem tecnologia própria, dados exclusivos ou posição de mercado defensáveis?

**Por que importa:** sem moat, qualquer concorrente bem-capitalizado copia em 6 meses. A Beyond aposta em coisas que ela **defende** depois de validadas.

**Rubrica:**
- **10**: tecnologia patenteada/proprietária + dados exclusivos + posição de mercado já conquistada.
- **8**: ou tecnologia única ou dataset exclusivo, validado pelo Buscador.
- **6**: diferencial declarado pelo founder, plausível, mas replicável em 12 meses.
- **4**: moat só "marca + execução" — sem barreira real.
- **2**: nenhum diferencial defensável; ideia é commodity.

**Sinais de discrepância:** founder afirma "tecnologia única" mas o dossiê lista 5 concorrentes com a mesma abordagem.

### 2. Alinhamento de Tese — peso original 10%

**Pergunta:** Está em vertical priorizada (LegalTech, EdTech, HealthTech, GovTech) ou gera valor para parceiros atuais do Extreme?

**Por que importa:** verticais priorizadas têm canal aberto, conhecimento institucional e expertise interna. Fora delas, a Aurora opera no escuro.

**Rubrica:**
- **10**: vertical priorizada explícita + modelo B2B/B2G + sinergia com portfólio existente.
- **8**: vertical priorizada.
- **6**: vertical adjacente (ex.: PropTech tangenciando GovTech).
- **4**: fora da tese mas com sinergia operacional clara.
- **2**: vertical fora da tese sem sinergia.

### 3. Problema Real — peso original 10%

**Pergunta:** Resolve dor latente e comprovada — não é "solução em busca de problema"?

**Por que importa:** a maior causa de morte de startup é construir coisa que ninguém quer. Aqui o sinal é se o founder **viveu** a dor ou está inventando.

**Rubrica:**
- **10**: dor vivida pelo founder + evidência de pesquisa (entrevistas, dados públicos) + dor confirmada pelo Buscador.
- **8**: dor com evidência sólida (pesquisa ou dado público).
- **6**: dor plausível, founder descreve bem mas evidência fraca.
- **4**: dor inferida, sem prova de quem sente.
- **2**: solução em busca de problema.

**Sinais de discrepância:** founder declara "20 entrevistas" mas não detalha; dossiê não confirma a dor.

### 4. TAM/SAM/SOM — peso original 10%

**Pergunta:** O tamanho do prêmio vale o esforço?

**Por que importa:** mercado pequeno = teto baixo. Não importa quão eficiente seja o produto, o retorno é capped.

**Rubrica:**
- **10**: TAM relevante (>R$ 1Bi) + SOM realista + projeção do Buscador alinhada.
- **8**: TAM/SAM/SOM declarados e validados pelo Buscador.
- **6**: TAM ok, SOM crível mas otimista.
- **4**: TAM declarado divergente do Buscador em até 3x.
- **2**: TAM inflado em mais de 3x; nicho minúsculo.

**Sinais de discrepância:** founder declara TAM 5x maior que estimativa do Buscador → severidade alta.

### 5. Escalabilidade Tecnológica — peso original 10%

**Pergunta:** Receita cresce sem aumento proporcional de custo (negócio de tecnologia, não de serviço)?

**Por que importa:** o modelo de venture é assimétrico — só faz sentido se o teto for muito maior que o investimento. Modelos de serviço, mesmo bons, têm teto linear.

**Rubrica:**
- **10**: SaaS puro / marketplace / mídia digital — custo marginal próximo de zero.
- **8**: SaaS com componente de serviço pequeno.
- **6**: híbrido com 30-50% de receita em serviço.
- **4**: maior parte da receita exige pessoas humanas.
- **2**: consultoria/agência disfarçada de produto.

### 6. Escalabilidade Pública (B2G) — peso original 10%

**Pergunta:** Tem potencial em canal público / editais?

**Por que importa:** B2G é canal estratégico da Beyond. Não é gate, mas adiciona upside relevante.

**Rubrica:**
- **10**: GovTech pura ou produto B2B com canal B2G claro + cliente público já mapeado.
- **8**: produto adaptável a B2G com pouco esforço.
- **6**: B2G é possibilidade futura.
- **4**: nenhuma aderência a setor público.
- **2**: explicitamente B2C de consumo final.

### 7. Aproveitamento de Infra Beyond — peso original 5%

**Pergunta:** Usa governança ou IA do grupo (correlacionado com critério 15)?

**Por que importa:** projetos que usam infra Beyond têm CAC menor (canal de marketing compartilhado) e dev mais rápido (componentes prontos).

**Rubrica:**
- **10**: founder marcou SIM + plano explícito de uso da infra (canal de marketing + stack IA do grupo).
- **8**: SIM com uso parcial.
- **6**: SIM declarado mas sem detalhe de como.
- **4**: NÃO mas com adaptação possível.
- **2**: NÃO + produto não se beneficia.

### 8. Velocidade MVP — peso original 10%

**Pergunta:** Teste funcional viável em 1-4 semanas?

**Por que importa:** o ciclo de validação Aurora é de 90 dias. Se o MVP demora 12 semanas, não dá tempo de medir.

**Rubrica:**
- **10**: SIM + plano detalhado de 4 semanas + stack permite.
- **8**: SIM + plano plausível.
- **6**: SIM declarado mas plano vago.
- **4**: 6-8 semanas viáveis, fora do envelope.
- **2**: NÃO ou >12 semanas.

### 9. Pesquisa Pesada vs Vibe Coding — peso original 5%

**Pergunta:** Exige pesquisa demorada (não-trivial em IA)?

**Por que importa:** este é o critério **invertido**: pesquisa pesada penaliza, pois implica risco técnico alto e ciclo de validação inadequado. Vibe coding (uso de IA generativa para codar rápido) bonifica.

**Rubrica:**
- **10**: 100% buildable com IA generativa atual; nenhuma pesquisa nova.
- **8**: 90% buildable, 10% requer fine-tuning trivial.
- **6**: requer engenharia mas sem pesquisa.
- **4**: pesquisa específica em domínio (NLP customizado, modelo proprietário).
- **2**: pesquisa de fronteira (treinar LLM do zero, computer vision exótica).

### 10. Risco Regulatório — VETO — peso original 10%

**Pergunta:** Existem barreiras regulatórias/jurídicas que **inviabilizam** o modelo?

**Por que importa:** este é o **único critério com poder de veto**. Não importa quão boa a ideia seja: se o modelo é proibido por lei, mata.

**Rubrica:**
- **10**: sem barreira; setor maduro regulatoriamente.
- **8**: barreira leve (LGPD trivial), gerenciável.
- **6**: setor regulado, exige adequação.
- **4**: setor regulado, exige licença demorada.
- **2**: barreira séria, viável só com lobby.
- **1**: barreira que **inviabiliza** o modelo atual — **VETO** (ex.: diagnóstico médico via IA sem registro ANVISA/CFM; cassino online no Brasil; oferta de crédito sem licença BCB).

**Sinais de discrepância:** founder declara "barreira_legal_imediata: false" mas auto-research jurídico identifica barreira ativa → discrepância de severidade alta + VETO se barreira inviabilizar.

### 11. Conhecimento Interno — peso original 5%

**Pergunta:** A Beyond já sabe fazer algo similar?

**Por que importa:** quando o grupo já tem expertise no domínio, o time toma decisão mais rápido e erra menos.

**Rubrica:**
- **10**: produto adjacente a algo que a Beyond já operou.
- **8**: stack tecnológico conhecido pela Beyond.
- **6**: vertical conhecida, produto novo.
- **4**: domínio adjacente.
- **2**: completamente fora da expertise.

### 12. Processo Comercial — peso original 5%

**Pergunta:** O time comercial já sabe vender isso (canal aberto)? (correlacionado com critério 16)

**Por que importa:** canal aberto = primeiros clientes em semanas, não meses. Canal a abrir = ciclo de venda longo.

**Rubrica:**
- **10**: founder tem canal direto + Beyond tem canal complementar.
- **8**: founder tem canal próprio testado.
- **6**: founder tem rede para abrir canal.
- **4**: nenhum canal pronto, mas perfil comercial existe no time.
- **2**: ninguém sabe vender, ninguém tem rede.

---

## Camada 2 — 4 critérios específicos de Mercado / Inorgânico / Interno

Como o formulário Aurora traz bloco completo de Founders (Educação, Histórico, LinkedIn, Conquistas), ficamos aptos a avaliar esses critérios — antes considerados fora de escopo no esboço inicial.

### 13. Perfil do Founder — peso original 20% (do bloco específico)

**Pergunta:** Owner tem perfil empreendedor, resiliência, foco em resultados?

**Rubrica:**
- **10**: founder serial (já operou e saiu) + experiência relevante no domínio + sinais públicos de excelência.
- **8**: founder com 1 empresa anterior bem-sucedida ou histórico em scale-up.
- **6**: profissional sênior com experiência em domínio adjacente.
- **4**: junior com vontade mas pouca trajetória.
- **2**: perfil acadêmico/corporate sem sinal empreendedor.

### 14. Dono da Briga — peso original 20%

**Pergunta:** Há responsável claro que dedicará tempo necessário à incubação?

**Rubrica:**
- **10**: founder full-time há >6 meses + dedicação 100%.
- **8**: full-time há >3 meses ou dedicação 80%+.
- **6**: part-time alto (>50%) com plano de fechar.
- **4**: part-time baixo, sem prazo para fechar.
- **2**: side project; founder com vínculo CLT inegociável.

### 15. Sinergia Operacional / CAC — peso original 20% (correlacionado com critério 7)

**Pergunta:** Conseguimos reduzir custos ou CAC usando infra Beyond?

**Regra de deduplicação:** se o critério 7 já cobre, esta nota acompanha. Se o critério 7 é vago e este é específico (founder detalhou como usaria), prevalece este.

### 16. Canais de Venda — peso original 20% (correlacionado com critério 12)

**Pergunta:** Owner tem acesso direto aos canais ou rede necessária para validar?

**Regra de deduplicação:** equivalente ao critério 12, mas focado em **acesso direto** (founder pessoalmente abre porta) vs. **processo comercial maduro** (time vende). Se founder tem rede pessoal forte, este sobe.

---

## Reescalonamento de pesos

Pesos originais do Playbook (somando 140%) → reescalonados para 100:

| # | Critério | Peso original | Peso normalizado |
|---|---|---|---|
| 1 | Moat | 10% | 7.1 |
| 2 | Alinhamento Tese | 10% | 7.1 |
| 3 | Problema Real | 10% | 7.1 |
| 4 | TAM/SAM/SOM | 10% | 7.1 |
| 5 | Escalabilidade Tec | 10% | 7.1 |
| 6 | Escalabilidade Pública | 10% | 7.1 |
| 7 | Infra Beyond | 5% | 3.6 |
| 8 | Velocidade MVP | 10% | 7.1 |
| 9 | Pesquisa vs Vibe | 5% | 3.6 |
| 10 | Risco Regulatório | 10% | 7.1 |
| 11 | Conhecimento Interno | 5% | 3.6 |
| 12 | Processo Comercial | 5% | 3.6 |
| 13 | Perfil Founder | 20% | 14.4 |
| 14 | Dono da Briga | 20% | 14.4 |
| 15 | Sinergia Operacional | (já em 7) | 0 |
| 16 | Canais Venda | (já em 12) | 0 |
| **Total** | | **140%** | **100.0** |

**Deduplicação:** os pesos dos critérios 15 e 16 foram absorvidos pelos critérios 7 e 12 respectivamente (correlação alta). Os critérios 15 e 16 ainda recebem nota e entram no output para riqueza qualitativa, mas com `peso_normalizado: 0` — não contam no score numérico.

**Fórmula final:**

```
score_parcial_fit = Σ (nota_i × peso_normalizado_i) / 10
```

Resultado: número entre 0 e 100.

---

## Recomendação final

| Score | Recomendação |
|---|---|
| `< 60` | **descartar** |
| `60-80` | **validar** |
| `> 80` | **prioridade** |
| VETO acionado | **descartar** (automático, prevalece sobre score) |
