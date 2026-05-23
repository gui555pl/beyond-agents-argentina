/**
 * Registry compartilhado de tools.
 *
 * Toda tool nova deve:
 *   1. ser criada num arquivo próprio em src/tools/<nome>.ts via createTool()
 *   2. ser importada e adicionada a `toolRegistry` abaixo
 *
 * Os agentes referenciam tools pelo ID camelCase listado aqui
 * (ex: agent.config.ts → tools: ['runcomfy', 'webSearch']).
 */
import { runcomfyTool } from './runcomfy.js';
import { criadorLpTool } from './criador-lp.js';
import { criadorAdsTool } from './criador-ads.js';

export const toolRegistry = {
  runcomfy: runcomfyTool,
  'criador-lp': criadorLpTool,
  'criador-ads': criadorAdsTool,
} as const;

export type ToolId = keyof typeof toolRegistry;

/**
 * Seleciona um subconjunto de tools do registry pelo id.
 * Lança erro descritivo se algum id não existir — assim o erro acontece
 * no boot do dev server, não em runtime no meio de uma conversa.
 */
export function pickTools(ids: readonly string[]): Record<string, (typeof toolRegistry)[ToolId]> {
  const picked: Record<string, (typeof toolRegistry)[ToolId]> = {};
  const available = Object.keys(toolRegistry);

  for (const id of ids) {
    if (!(id in toolRegistry)) {
      throw new Error(
        `Tool "${id}" não existe no registry. Tools disponíveis: ${available.join(', ') || '(nenhuma)'}. ` +
          `Adicione-a em src/tools/index.ts ou ajuste o agent.config.ts.`,
      );
    }
    picked[id] = toolRegistry[id as ToolId];
  }

  return picked;
}
