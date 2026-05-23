/**
 * Leandro LP — copywriting + design de landing page.
 *
 * Substitui o mock Criador de LP no pipeline. Roda 1× por nó da árvore.
 * Recebe Copy Guide da Beatriz como contexto e devolve HTML completo
 * standalone (renderizado em iframe via data-URL).
 *
 * Sem tools — depende apenas do contexto do prompt + Copy Guide injetado.
 */
export default {
  description:
    'Gera HTML completo de landing page por hipótese, usando o Copy Guide estratégico da Beatriz e seguindo a estética calibrada por vertical (Erudio para EdTech, MedFlow para HealthTech).',
  tools: [] as const,
  model: 'claude-sonnet-4-5' as const,
};
