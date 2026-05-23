---
name: benchmark-e-gera-lps
description: Análise de concorrentes + Copy Guide + 5 Landing Pages automatizadas em um workflow
time_saved_minutes: 480
---

# Skill: Benchmark de Mercado + Geração de Landing Pages

## O que faz

Esta skill automatiza o workflow completo de **benchmarking competitivo até entrega final de landing pages**:

1. **Análise de Concorrentes** — acessa as URLs fornecidas, extrai Copy Guide e Diretrizes de LP baseadas em frameworks (ICP, JTBD, Pain-Gain, PAS, MECLABS, CRO)
2. **Geração de Hipóteses** — identifica 5 ângulos estratégicos (hipóteses) a partir da análise
3. **Delegação ao Leandro LP** — passa os documentos gerados para que o Leandro crie 5 LPs completas em HTML
4. **Entrega Final** — retorna todos os arquivos prontos para teste e implementação

## Quando usar

- Você tem um produto/serviço e quer entender **como posicioná-lo contra concorrentes**
- Precisa de **diretrizes estratégicas de copywriting** baseadas em dados reais de mercado
- Quer **5 hipóteses de landing page testáveis** geradas em horas, não semanas
- Busca **LPs prontas para A/B testing** com headlines, CTAs e narrativas diferentes

## Como usar

### Input

Forneça ao agente Beatriz:

```
Analisa esses 5 concorrentes e gera benchmark + 5 LPs:
- https://www.concorrente1.com
- https://www.concorrente2.com
- https://www.concorrente3.com
- https://www.concorrente4.com
- https://www.concorrente5.com
```

Ou de forma mais estruturada:

```
Produto/Serviço: [seu produto]
Segmento: [seu segmento: B2B, B2C, Enterprise, etc]
URLs dos concorrentes: [lista]

Usar skill "benchmark-e-gera-lps"
```

### Fluxo Automático

```
Beatriz Benchmarking (você) 
  ↓
  [Analisa 5 URLs → extrai dados]
  ↓
  [Gera Copy Guide JSON + Diretrizes]
  ↓
  [Identifica 5 hipóteses estratégicas]
  ↓
  Delega ao Leandro LP
    ↓
    [Leandro cria 5 LPs HTML]
  ↓
  Retorna: 5 arquivos + sumário executivo
```

### Output

Você receberá:

1. **Copy Guide** (JSON) — ICP, JTBD, Pain-Gain, PAS, Tom de Voz, Diretrizes Mínimas
2. **Análise de Concorrentes** (JSON) — breakdown de cada LP concorrente com CRO scores
3. **5 Hipóteses Estratégicas** (Markdown) — ângulos diferentes de posicionamento
4. **5 Landing Pages** (HTML) — prontas para abrir no browser e testar
5. **Sumário Executivo** (Markdown) — recomendações e gaps competitivos

## Estrutura dos Documentos Gerados

### Copy Guide (Schema JSON)
- **ICP** — perfil demográfico, psicográfico, nível de consciência
- **JTBD** — jobs funcional, emocional, social com evidências
- **Pain-Gain** — 5 dores + 5 ganhos ordenados por intensidade
- **PAS** — problema, agitação, solução narrativa
- **Tone of Voice** — personalidade, register, dos/donts, benchmarks de brand
- **Value Proposition** — headline, subheadline, UVP única

### Análise de Concorrentes (Schema JSON)
- **Hero Section** — headline, subheadline, CTA de cada concorrente
- **Narrative Framework** — qual estrutura narrativa (AIDA, PAS, StoryBrand, etc)
- **MECLABS Scores** — avaliação de motivação, clareza, incentivo, fricção, ansiedade
- **CRO Score** — pontuação 0-20 em 10 critérios de conversão
- **Strengths & Weaknesses** — o que cada concorrente faz bem/mal
- **Opportunity Gap** — onde você pode se diferenciar

### 5 Hipóteses (Markdown)
Cada hipótese estruturada como:
- **Nome** — slug da hipótese
- **Public-Alvo** — quem é o herói
- **Ângulo** — qual problema/benefit central
- **Headline Sugerida** — proposta de valor principal
- **Diferenciação** — o que a distingue dos concorrentes
- **Estrutura Narrativa** — qual framework contar a história

### 5 Landing Pages (HTML)
Cada LP autônoma com:
- Hero section (problema → agitação → solução)
- Social proof (depoimentos, logos, números)
- Feature breakdown alinhada ao ângulo
- CTA otimizado para a hipótese
- Mobile-first responsive
- Pronta para testar em navegador

## Exemplo Real: Erudio

**Input:**
```
Produto: Erudio (plataforma educacional)
Segmento: B2B — hospitais + corporativo
Análise: 5 competidores diretos
```

**Output gerado:**
1. Copy Guide identifi­cava 3 ICPs diferentes (gestor hospitalar, coordenador T&D, diretor educacional)
2. Análise descobriu que **nenhum concorrente comunicava auditoria/compliance** adequadamente
3. 5 hipóteses criadas:
   - LP 1: "Rodízio Automatizado" (Gestor hospitalar)
   - LP 2: "Autonomia T&D" (Coordenador corporativo)
   - LP 3: "Visão 360 Integrada" (Diretor educacional)
   - LP 4: "Tranquilidade Regulatória" (Compliance officer)
   - LP 5: "IA Especializada BR" (Todos — diferenciação regional)
4. Leandro LP gerou as 5 LPs em HTML
5. **Resultado:** 5 ângulos testáveis, cada um atacando um público e pain específico

## Critérios de Sucesso

✅ Copy Guide gerado em JSON válido com todos os frameworks aplicados
✅ Análise de concorrentes com CRO scores e narrativa framework identificada
✅ 5 hipóteses distintas, cada uma com ângulo único de diferenciação
✅ 5 LPs em HTML, autônomas, testáveis no browser
✅ Documentação executiva entregue em Markdown

## Notas Técnicas

- **Frameworks aplicados:** ICP, JTBD, Pain-Gain, PAS, Tom de Voz, MECLABS (6 variáveis), CRO (10 critérios), Análise Narrativa
- **Fonte de dados:** web scraping + WebFetch das URLs fornecidas (nunca suposição)
- **Validação:** cada elemento recebe um campo "Não identificado" se não encontrado nas LPs (zero invenção)
- **Delegação:** após documentos prontos, chama Leandro LP via `delegate_to_agent` com contexto completo
- **Tempo típico:** 20-30 min para 5 URLs + análise + delegação + geração LPs

## Limitações

- Requer URLs públicas (sem autenticação)
- Se concorrente usar Captcha, a análise pula aquela página
- CRO scores são baseados em checklist objetivo (não em teste A/B real)
- Narrativas são inferidas do conteúdo observado, não de intenção do designer

## Próximos Passos Após a Skill

1. Abrir as 5 LPs em navegador e testar fluxo de conversão
2. Selecionar as 2-3 hipóteses mais promissoras
3. Implementar versão HTML em produção (ou converter pra Webflow/Next.js)
4. A/B testar headlines e CTAs entre as hipóteses
5. Iterar com dados reais de cliques, scroll, conversão
