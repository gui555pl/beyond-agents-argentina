# Leandro LP — Export completo

Pacote com a configuracao completa do agente **Leandro LP** (especialista
em Copywriting e Otimizacao de Conversao) pra rodar localmente.

## Estrutura

```
leandro-lp-export/
├── README.md                              <- voce esta aqui
├── persona/
│   └── leandro-lp-system-prompt.md        <- system prompt da persona
├── skills/
│   ├── copywriting/                       <- skill de copy (SKILL.md + refs + evals)
│   ├── frontend-design/                   <- skill de design frontend
│   └── web-design-guidelines/             <- skill de revisao UI
└── config/
    └── integrations.md                    <- nota sobre integracoes
```

## Como usar localmente

### Opcao A — Claude Code (recomendado)

1. No seu PC, va para a pasta do projeto onde quer usar o agente.
2. Copie a pasta `skills/` inteira para `~/.claude/skills/` (cria as
   tres skills em escopo global) **ou** para `.claude/skills/` dentro
   do projeto (escopo local).
3. Crie um subagent ou um CLAUDE.md no projeto colando o conteudo de
   `persona/leandro-lp-system-prompt.md` como instrucao do agente.
4. Quando voce pedir copy/landing page, o Claude Code carrega
   automaticamente a skill `copywriting`.

### Opcao B — API direta (Anthropic SDK)

```python
from anthropic import Anthropic

client = Anthropic()

system_prompt = open("persona/leandro-lp-system-prompt.md").read()

resp = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=4096,
    system=system_prompt,
    messages=[{"role": "user", "content": "<seu briefing aqui>"}],
)
print(resp.content[0].text)
```

Para usar as skills via API, voce precisa do recurso de **Managed
Agents / Skills** da Anthropic — anexar os arquivos das skills via
Files API e referenciar no system prompt.

### Opcao C — ChatGPT / outro LLM

Cole o conteudo de `persona/leandro-lp-system-prompt.md` como
"Custom Instructions" ou "System Prompt" da ferramenta. As skills
em markdown podem ser anexadas como conhecimento adicional
(arquivos de referencia).

## O que NAO foi exportado

- **Estado das integracoes Composio** (Gmail, GitHub, Slack, etc.):
  a chamada de listagem retornou 401 no momento da exportacao. Veja
  `config/integrations.md`.
- **Memorias persistentes do agente**: nao havia memorias gravadas
  em `MEMORY.md` no momento da exportacao.
- **Historico de conversas anteriores**: nao e exportavel.
- **Credenciais salvas no cofre**: nunca sao exportaveis em texto
  (por design de seguranca do VolundOS).

## Versao / data da exportacao

- Data: 2026-05-23
- Modelo base: claude-opus-4-7 (1M context)
- Shell: VolundOS Nucleo 2.0
