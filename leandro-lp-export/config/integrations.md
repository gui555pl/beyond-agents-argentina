# Integracoes

A listagem ao vivo das integracoes Composio falhou no momento da exportacao
(erro 401 — chave de API invalida no contexto do sandbox). Por isso esta
lista nao reflete o estado real das integracoes conectadas a este agente.

Para recuperar a lista atualizada quando rodar localmente:

1. Configure sua propria chave Composio (ou o gestor de integracoes que
   voce vai usar no PC local).
2. No Claude Code local, use a tool MCP equivalente
   (`mcp__volund__manage_integrations` ou similar) com `action: "list"`.

## Integracoes citadas no system prompt do agente

O system prompt do VolundOS menciona estes servicos como tipicos pra
agentes desse tipo — nao significa que estavam conectados a este agente
em especifico, e sim que sao os caminhos preferidos:

- Gmail
- GitHub
- Slack
- Google Sheets
- Notion
- Google Admin

Para landing pages (caso de uso do Leandro LP), nenhuma integracao
externa e estritamente necessaria — o agente opera 100% sobre o
documento que voce envia na conversa.
