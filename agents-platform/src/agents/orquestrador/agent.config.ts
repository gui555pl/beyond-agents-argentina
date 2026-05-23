/**
 * Orquestrador — decide expandir/refinar/podar/promover a cada veredito.
 *
 * Sem tools — só raciocínio sobre estado da árvore. As ações são executadas
 * pelo workflow externo que lê o JSON devolvido.
 */
export default {
  description:
    'Decide a cada veredito se expande, refina, poda ou promove o nó. Mantém os caps determinísticos do palco.',
  tools: [] as const,
  model: 'claude-haiku-4-5' as const,
};
