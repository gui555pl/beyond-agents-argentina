#!/usr/bin/env node
/**
 * Scaffolder de agentes Mastra.
 *
 * Uso: npm run create-agent
 *
 * Pergunta nome, descrição, tools e modelo. Cria:
 *   src/agents/<nome>/prompt.md
 *   src/agents/<nome>/agent.config.ts
 *
 * O auto-loader (src/mastra/registry.ts) descobre e registra automaticamente
 * na próxima vez que `mastra dev` for executado.
 */
import { input, checkbox, select } from '@inquirer/prompts';
import { readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const AGENTS_DIR = resolve(process.cwd(), 'src/agents');
const TOOLS_DIR = resolve(process.cwd(), 'src/tools');

// ─── helpers ────────────────────────────────────────────────────────────────

function listAvailableTools(): string[] {
  if (!existsSync(TOOLS_DIR)) return [];
  return readdirSync(TOOLS_DIR)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
    .map((f) => f.replace(/\.ts$/, ''));
}

function fileToToolId(filename: string): string {
  return filename.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

// ─── templates ──────────────────────────────────────────────────────────────

function buildPromptTemplate(name: string, description: string, tools: string[]): string {
  const toolSection =
    tools.length > 0
      ? `\n## Tools disponíveis\n\n${tools
          .map((t) => `- \`${t}\`: [explique quando o agente deve usar]`)
          .join('\n')}\n`
      : '';

  return `# ${name}

> ${description}
>
> Edite este arquivo livremente. Tudo ABAIXO da linha "---" é o system prompt
> que o agente recebe. Salve e recarregue o Studio para ver o efeito.

---

Você é ${description.toLowerCase()}.

## Sua tarefa

[Descreva aqui, em passos, o que o agente faz e como ele decide o que fazer]
${toolSection}
## Estilo de comunicação

- Responda em português do Brasil
- Seja direto e objetivo
- [adicione outras diretrizes específicas deste agente]
`;
}

function buildConfig(description: string, tools: string[], model: string): string {
  return `/**
 * Config do agente. Mude tools/model aqui; mude o system prompt em prompt.md.
 */
export default {
  description: ${JSON.stringify(description)},
  tools: ${JSON.stringify(tools)} as const,
  model: ${JSON.stringify(model)} as const,
};
`;
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\nCriar novo agente Mastra\n');

  const name = await input({
    message: 'Nome do agente (kebab-case, ex: lp-copywriter):',
    validate: (value: string) => {
      if (!value) return 'Nome obrigatório';
      if (!/^[a-z][a-z0-9-]*$/.test(value)) {
        return 'Use kebab-case: letras minúsculas e hífens, começando com letra';
      }
      if (existsSync(join(AGENTS_DIR, value))) {
        return `Já existe um agente chamado "${value}"`;
      }
      return true;
    },
  });

  const description = await input({
    message: 'Descrição curta (1 linha, ex: "Gerador de imagens para LPs"):',
    validate: (v: string) => v.trim().length > 0 || 'Descrição obrigatória',
  });

  const availableTools = listAvailableTools();
  let selectedTools: string[] = [];

  if (availableTools.length === 0) {
    console.log('\nAviso: nenhuma tool encontrada em src/tools/. Agente será criado sem tools.');
  } else {
    selectedTools = await checkbox({
      message: 'Quais tools este agente vai usar? (espaço seleciona, enter confirma)',
      choices: availableTools.map((t) => ({ name: t, value: fileToToolId(t) })),
    });
  }

  const model = await select({
    message: 'Qual modelo Claude?',
    default: 'claude-haiku-4-5',
    choices: [
      { name: 'claude-haiku-4-5   (padrão — rápido e barato)', value: 'claude-haiku-4-5' },
      { name: 'claude-sonnet-4-5  (caro — use só se Haiku não dá conta)', value: 'claude-sonnet-4-5' },
      { name: 'claude-opus-4-7    (muito caro)', value: 'claude-opus-4-7' },
    ],
  });

  const agentDir = join(AGENTS_DIR, name);
  mkdirSync(agentDir, { recursive: true });

  writeFileSync(
    join(agentDir, 'prompt.md'),
    buildPromptTemplate(name, description, selectedTools),
  );
  writeFileSync(
    join(agentDir, 'agent.config.ts'),
    buildConfig(description, selectedTools, model),
  );

  console.log(`\nOK: agente "${name}" criado em src/agents/${name}/\n`);
  console.log('Próximos passos:');
  console.log(`  1. Edite o system prompt: src/agents/${name}/prompt.md`);
  console.log(`  2. Rode:  npm run dev`);
  console.log(`  3. Abra http://localhost:4111 e converse com seu agente\n`);
}

main().catch((err: unknown) => {
  const e = err as { name?: string; message?: string };
  if (e?.name === 'ExitPromptError') {
    console.log('\nCancelado.');
    process.exit(0);
  }
  console.error('Erro:', err);
  process.exit(1);
});
