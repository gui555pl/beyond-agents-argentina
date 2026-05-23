# agents-platform

Plataforma local de agentes Claude (system prompt + tools), substituindo o uso
interno do VolundOS pra iteração visual via Mastra Studio.

## Pré-requisitos

- Node.js 20.20+ ou 22.22+
- Chave da Anthropic ([console.anthropic.com](https://console.anthropic.com/settings/keys))
- (Opcional) Credenciais da Runcomfy se for usar a tool de imagem

## Setup (uma vez só)

```bash
cd agents-platform
npm install
cp .env.example .env
# edite o .env e preencha ANTHROPIC_API_KEY (e RUNCOMFY_* se for usar)
```

## Rodar

```bash
npm run dev
```

Abre o Mastra Studio em `http://localhost:4111`. Todos os agentes em
`src/agents/` aparecem na sidebar. Chat, tool calls e traces ficam visíveis.

## Criar um agente novo

**Forma recomendada — CLI interativa:**

```bash
npm run create-agent
```

O CLI pergunta:

1. Nome (kebab-case, ex: `lp-copywriter`)
2. Descrição (1 linha)
3. Quais tools usar (lista detectada automaticamente de `src/tools/`)
4. Qual modelo Claude

E gera `src/agents/<nome>/prompt.md` + `agent.config.ts` com template já
pré-estruturado. Depois é só editar o `prompt.md` no seu editor favorito.

**Forma manual:**

1. Crie a pasta `src/agents/meu-agente/`
2. Crie `prompt.md`:

   ```markdown
   # meu-agente

   > Descrição curta

   ---

   Você é... [system prompt aqui]
   ```

3. Crie `agent.config.ts`:

   ```ts
   export default {
     description: 'Descrição curta',
     tools: ['runcomfy'] as const,
     model: 'claude-sonnet-4-5' as const,
   };
   ```

4. `npm run dev` — o agente aparece no Studio.

## Iterar num agente existente

- Edite `src/agents/<nome>/prompt.md` → salve → recarregue o Studio
- Pra mudar tools ou modelo, edite `agent.config.ts`
- O system prompt é tudo que vem **depois** do primeiro `---` no `prompt.md`

## Adicionar uma tool nova

1. Crie `src/tools/<minha-tool>.ts` usando `createTool({ id, description, inputSchema, outputSchema, execute })`
2. Importe e registre em `src/tools/index.ts` dentro de `toolRegistry`
3. O CLI passa a oferecê-la automaticamente

## Estrutura

```
agents-platform/
├── src/
│   ├── tools/              biblioteca de tools (1 arquivo por tool)
│   ├── agents/             1 pasta = 1 agente
│   └── mastra/             auto-loader e entrypoint
├── scripts/
│   └── create-agent.ts     CLI interativo
└── .env                    chaves (nunca commitar)
```

## Build pra deploy (futuro)

```bash
npm run build
```

Gera bundle em `.mastra/` pronto pra Vercel, Cloudflare ou Node standalone.

## Notas

- **Tool Runcomfy**: o shape em `src/tools/runcomfy.ts` é placeholder. Ajustar
  body/resposta contra o contrato real do VolundOS antes do primeiro uso real.
- **Modelo padrão**: `claude-sonnet-4-5`. Override por agente no `agent.config.ts`.
