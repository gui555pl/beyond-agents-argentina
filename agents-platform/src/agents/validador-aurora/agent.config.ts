/**
 * Validador Aurora — aplica o scorecard do Playbook de Seleção sobre uma hipótese.
 *
 * Recebe: { submissao_aurora, hipotese_no_no, dossie_buscador } como JSON.
 * Devolve: JSON com score_parcial_fit, veto, criterios[], tags, recomendacao_playbook, discrepancias.
 *
 * Sem tools — raciocínio puro sobre input estruturado.
 */
export default {
  description:
    'Aplica o scorecard do Playbook de Seleção Aurora (16 critérios) sobre uma hipótese e devolve fit estratégico + recomendação.',
  tools: [] as const,
  model: 'claude-haiku-4-5' as const,
};
