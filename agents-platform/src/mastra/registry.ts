/**
 * Auto-loader de agentes.
 *
 * Convenção:
 *   src/agents/<nome>/
 *     ├── prompt.md           # system prompt em markdown (tudo abaixo do primeiro `---`)
 *     └── agent.config.ts     # export default { description, tools[], model }
 *
 * Esta função varre src/agents/, importa cada config dinamicamente, lê o prompt,
 * e devolve um mapa { [nome]: Agent } pronto pra ser passado em new Mastra({ agents }).
 */
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { pickTools } from '../tools/index.js';

const DEFAULT_MODEL = 'claude-haiku-4-5' as const;

export interface AgentConfig {
  description?: string;
  tools?: readonly string[];
  model?: string;
}

/**
 * Resolve o diretório src/agents/ a partir deste arquivo,
 * independente de cwd ou de onde o mastra dev for invocado.
 */
function getAgentsDir(): string {
  return resolve(import.meta.dirname, '..', 'agents');
}

/**
 * Remove o "header de documentação" de prompt.md.
 * Convenção: tudo antes do PRIMEIRO `---` em linha própria é descartado;
 * o que sobra é o system prompt real entregue ao modelo.
 *
 * Se não houver `---`, o arquivo inteiro é usado como prompt.
 */
function stripFrontmatter(raw: string): string {
  const lines = raw.split('\n');
  const dividerIdx = lines.findIndex((line) => line.trim() === '---');
  if (dividerIdx === -1) return raw.trim();
  return lines.slice(dividerIdx + 1).join('\n').trim();
}

async function loadAgentConfig(agentDir: string, name: string): Promise<AgentConfig> {
  const configPath = join(agentDir, 'agent.config.ts');
  if (!existsSync(configPath)) {
    throw new Error(`Agente "${name}" sem agent.config.ts em ${configPath}`);
  }
  const mod = (await import(pathToFileURL(configPath).href)) as { default?: AgentConfig };
  const cfg = mod.default;
  if (!cfg || typeof cfg !== 'object') {
    throw new Error(`agent.config.ts de "${name}" deve exportar default um objeto`);
  }
  return cfg;
}

function loadInstructions(agentDir: string, name: string): string {
  const promptPath = join(agentDir, 'prompt.md');
  if (!existsSync(promptPath)) {
    throw new Error(`Agente "${name}" sem prompt.md em ${promptPath}`);
  }
  const raw = readFileSync(promptPath, 'utf-8');
  const stripped = stripFrontmatter(raw);
  if (!stripped) {
    throw new Error(`prompt.md de "${name}" vazio depois de remover o cabeçalho (---).`);
  }
  return stripped;
}

export async function loadAgents(): Promise<Record<string, Agent>> {
  const agentsDir = getAgentsDir();
  if (!existsSync(agentsDir)) return {};

  const entries = readdirSync(agentsDir).filter((entry) => {
    const fullPath = join(agentsDir, entry);
    return statSync(fullPath).isDirectory() && !entry.startsWith('.') && !entry.startsWith('_');
  });

  const agents: Record<string, Agent> = {};

  for (const name of entries) {
    const agentDir = join(agentsDir, name);
    const config = await loadAgentConfig(agentDir, name);
    const instructions = loadInstructions(agentDir, name);
    const tools = pickTools(config.tools ?? []);
    const modelId = config.model ?? DEFAULT_MODEL;

    agents[name] = new Agent({
      id: name,
      name,
      description: config.description,
      instructions,
      model: anthropic(modelId),
      tools,
    });
  }

  return agents;
}
