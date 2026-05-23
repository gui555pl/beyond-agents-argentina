/**
 * Buscador — auto-research que valida e enriquece o formulário Aurora.
 *
 * Sem tools — recebe formulário + snapshot pré-coletado, devolve dossiê JSON.
 */
export default {
  description:
    'Valida concorrentes, TAM/SAM/SOM, dores e barreira regulatória cruzando formulário Aurora com snapshot de tendências.',
  tools: [] as const,
  model: 'claude-haiku-4-5' as const,
};
