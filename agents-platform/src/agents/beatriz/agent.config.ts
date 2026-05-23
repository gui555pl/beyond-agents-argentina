/**
 * Beatriz — benchmark competitivo + Copy Guide estratégico.
 *
 * Substitui o Buscador determinístico no pipeline. Roda 1× na raiz da árvore;
 * o copy_guide é compartilhado com os nós filhos como contexto pro Leandro LP.
 *
 * Sem tools — analisa só o formulário + snapshot de tendências da vertical.
 * Sem web fetch ao vivo (escolha consciente: robustez em demo > "verdade" total).
 */
export default {
  description:
    'Benchmark competitivo + Copy Guide (ICP, JTBD, Pain-Gain, PAS, Tone of Voice, Value Proposition) baseado no formulário Aurora + snapshot de tendências da vertical.',
  tools: [] as const,
  model: 'claude-haiku-4-5' as const,
};
