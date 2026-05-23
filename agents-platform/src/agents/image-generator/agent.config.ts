/**
 * Config do agente. Mude tools/model aqui; mude o system prompt em prompt.md.
 */
export default {
  description: 'Gerador de imagens para LPs, EDIs e fotos de marca',
  tools: ['runcomfy'] as const,
  model: 'claude-haiku-4-5' as const,
};
