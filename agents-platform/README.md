# agents-platform

Plataforma de agentes Claude que roda o pipeline de validação multi-tenant
do Beyond Agents (Autovalidador de Ideias) + Mastra Studio pra iteração
visual dos agentes.

## Pré-requisitos

- Node.js 20.20+ ou 22.22+
- Chave da Anthropic ([console.anthropic.com](https://console.anthropic.com/settings/keys))
- (Opcional) Credenciais da Runcomfy se for usar a tool de imagem

## Setup (uma vez só)

```bash
cd agents-platform
npm install
cp .env.example .env
# edite o .env e preencha ANTHROPIC_API_KEY (e opcionalmente PORT,
# MAX_CONCURRENT_RUNS, DATABASE_PATH)
```

O SQLite é criado automaticamente em `./data/runs.sqlite` no boot do
servidor. Migrations rodam no `initDb()` — não há comando manual.

## Rodar a plataforma demo (server + frontend)

Em dois terminais:

```bash
# Terminal 1 — backend HTTP+SSE multi-tenant
npm run server         # http://localhost:4001

# Terminal 2 — frontend Vite
cd web && npm run dev  # http://localhost:5173
```

Abra `http://localhost:5173/submit` para a tela pública do formulário ou
`http://localhost:5173/presenter` para o modo apresentador.

### Endpoints HTTP/SSE

| Método | Rota | Função |
|---|---|---|
| GET    | `/api/health` | Status + queue stats |
| GET    | `/api/fixture?vertical=edtech\|healthtech` | Defaults pré-carregados (Erudio ou MedFlow) |
| POST   | `/api/submissions` | Recebe form simplificado, expande e enfileira |
| GET    | `/api/submissions/:id` | Estado + dados da submissão |
| GET    | `/api/runs` | Lista runs ativas e recentes |
| GET    | `/api/runs/:runId/events` | SSE — stream de EventoPipeline |
| DELETE | `/api/runs/:runId` | Aborta a run (de verdade — via AbortSignal) |
| POST   | `/api/runs` | LEGACY — dispara fixture direto (modo apresentador) |

### Configuração

| Var | Default | O que faz |
|---|---|---|
| `ANTHROPIC_API_KEY` | (obrigatória) | Chave do Claude |
| `PORT` | 4001 | Porta do server HTTP+SSE |
| `MAX_CONCURRENT_RUNS` | 3 | Quantas runs rodam em paralelo no worker pool |
| `DATABASE_PATH` | `./data/runs.sqlite` | Caminho do SQLite |
| `DEMO_FAST_VALIDATION` | (off) | Substitui Validador LLM por mock determinístico |
| `DEMO_FAST_ORCHESTRATOR` | (off) | Substitui Orquestrador LLM por árvore de regras |

## Rodar o Mastra Studio (iteração visual de agentes)

```bash
npm run dev
```

Abre o Studio em `http://localhost:4111`. Todos os agentes em
`src/agents/` aparecem na sidebar.

## Criar um agente novo

```bash
npm run create-agent
```

O CLI pergunta nome, descrição, tools e modelo, e gera
`src/agents/<nome>/prompt.md` + `agent.config.ts` pré-estruturados.

## Estrutura

```
agents-platform/
├── data/                  # SQLite (gitignored)
├── src/
│   ├── server.ts          # HTTP + SSE + worker pool
│   ├── workflows/
│   │   ├── explorar-arvore.ts     # Loop principal da árvore
│   │   ├── pipeline-no.ts         # 7 agentes em cadeia por nó
│   │   ├── orquestrador.ts        # Chamada LLM do Orquestrador
│   │   ├── queue.ts               # Worker pool multi-tenant
│   │   └── submission-expander.ts # Form simplificado → SubmissaoAurora
│   ├── tools/             # criador-lp, criador-ads, miro-fish, performance
│   ├── agents/            # 1 pasta = 1 agente (prompt.md + agent.config.ts)
│   ├── fixtures/
│   │   ├── defaults-erudio.json       # Pré-preenche modo EdTech (Erudio)
│   │   ├── defaults-medflow.json      # Pré-preenche modo HealthTech (MedFlow)
│   │   ├── lps/                       # 6 LPs HealthTech + 6 Erudio
│   │   ├── ads/                       # 6 sets Ads HealthTech + 6 Erudio
│   │   ├── personas-healthtech.json   # 20 personas HealthTech
│   │   ├── personas-edtech.json       # 20 personas EdTech
│   │   └── lp-index.json              # Mapeia LP→Ads + vertical + tags
│   ├── lib/
│   │   ├── db.ts                  # SQLite (submissions + events)
│   │   ├── schemas.ts             # Zod schemas (validação API pública)
│   │   ├── cost-tracker.ts        # Tracker por runId
│   │   ├── anthropic-client.ts    # Wrapper único de callAgent + AbortSignal
│   │   └── tipos.ts               # Contratos compartilhados
│   └── mastra/            # Auto-loader pro Studio
├── web/                   # Frontend Vite + React + Zustand + ReactFlow
└── scripts/
    └── create-agent.ts    # CLI interativo
```

## Inventário de agentes

| # | Agente | Modelo | Função | Custo aprox./run |
|---|---|---|---|---|
| 1 | **Orquestrador** | `claude-haiku-4-5` | Decide expandir/refinar/podar/promover por nó | ~$0.05 |
| 2 | **Beatriz** | `claude-sonnet-4-5` | Benchmark competitivo + Copy Guide (ICP, JTBD, PAS, Tone) — roda 1× na raiz, copy_guide compartilhado | ~$0.20 |
| 3 | **Validador Aurora** | `claude-haiku-4-5` | Scorecard de 16 critérios + VETO regulatório | ~$0.10 |
| 4 | **Leandro LP** | `claude-sonnet-4-5` | Gera HTML standalone completo por hipótese, usando Copy Guide como contexto. Fallback automático pro pool de fixtures em caso de falha | ~$0.30 por nó |
| 5 | Criador de Ads | mock (fixtures) | 3 cards portrait por LP — pareados 1:1 com fixtures de LP | $0 |
| 6 | Gestor de Tráfego | mock (delay) | Handoff visual LP → Swarm | $0 |
| 7 | **Swarm (Miro Fish)** | `claude-haiku-4-5` | N personas em paralelo (8 default), retry de 429 | ~$0.04 |
| 8 | Performance Analyst | determinístico | Agrega respostas + thresholds → veredito | $0 |

**Custo total estimado por run** (~6 nós com Sonnet em Beatriz + Leandro): **$3-6**.

Para reduzir custo, ative `DEMO_FAST_VALIDATION=true` no `.env` — substitui
Beatriz (Sonnet) e Validador (Haiku) por mocks determinísticos. Leandro LP
continua rodando mas perde o Copy Guide como contexto, e ainda tem fallback
para o pool de fixtures se falhar.

## Notas

- **Multi-tenant**: até 3 runs simultâneas no worker pool. Cada submissão
  tem URL única navegável (`/runs/:runId`) que sobrevive ao restart do
  servidor (SQLite persiste tudo).
- **Cancelamento real**: `DELETE /api/runs/:runId` aborta as chamadas LLM
  em andamento via `AbortSignal` — não consome tokens depois do cancel.
- **Cleanup automático**: runs finalizadas há mais de 30 min saem da
  memória; events de runs finalizadas há mais de 24h saem do SQLite.
- **Robustez de pitch**: Beatriz e Leandro têm fallback automático para
  determinístico/pool de fixtures se a chamada LLM falhar (timeout, rate
  limit, JSON inválido, HTML malformado). O pipeline nunca trava.
- **Pasta `agents/buscador/`**: deprecada, mantida só como referência. O
  pipeline em `workflows/pipeline-no.ts` chama `agents/beatriz/` agora.
