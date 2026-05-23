import type { FormSimplificado } from './tipos';

/** Limites alinhados com o backend em produção (publico_alvo legado = 300). */
export const FORM_LIMITS = {
  nome_solucao: 80,
  descricao_curta: 180,
  dor_e_evidencia: 2000,
  publico_alvo: 300,
  diferencial_moat: 800,
  concorrentes: 600,
  tam_aproximado: 300,
  barreira_legal_detalhes: 800,
  founder_background: 1500,
} as const;

function clampStr(value: string, max: number): string {
  const t = value.trim();
  return t.length <= max ? t : t.slice(0, max);
}

/** Garante que o payload respeita os limites do servidor antes do POST. */
export function sanitizarFormParaEnvio(form: FormSimplificado): FormSimplificado {
  return {
    ...form,
    nome_solucao: clampStr(form.nome_solucao, FORM_LIMITS.nome_solucao),
    descricao_curta: clampStr(form.descricao_curta, FORM_LIMITS.descricao_curta),
    dor_e_evidencia: clampStr(form.dor_e_evidencia, FORM_LIMITS.dor_e_evidencia),
    publico_alvo: clampStr(form.publico_alvo, FORM_LIMITS.publico_alvo),
    diferencial_moat: clampStr(form.diferencial_moat, FORM_LIMITS.diferencial_moat),
    concorrentes: clampStr(form.concorrentes, FORM_LIMITS.concorrentes),
    tam_aproximado: clampStr(form.tam_aproximado, FORM_LIMITS.tam_aproximado),
    founder_background: form.founder_background
      ? clampStr(form.founder_background, FORM_LIMITS.founder_background)
      : undefined,
    barreira_legal_detalhes: form.barreira_legal_detalhes
      ? clampStr(form.barreira_legal_detalhes, FORM_LIMITS.barreira_legal_detalhes)
      : undefined,
    email: form.email?.trim() || undefined,
  };
}
