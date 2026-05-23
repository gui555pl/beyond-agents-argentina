/**
 * Entrypoint consumido por `mastra dev` / `mastra build`.
 *
 * Tudo o que aparece no Studio (localhost:4111) é registrado aqui.
 * Agentes são descobertos automaticamente por src/mastra/registry.ts.
 */
import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { loadAgents } from './registry.js';

const agents = await loadAgents();

export const mastra = new Mastra({
  agents,
  logger: new PinoLogger({
    name: 'agents-platform',
    level: 'info',
  }),
});
