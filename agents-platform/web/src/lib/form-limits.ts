import type { FormSimplificado } from './tipos';

/**
 * Limites espelhados em `agents-platform/src/lib/schemas.ts` (FormSimplificadoSchema).
 * Fonte única no frontend — backend valida o mesmo contrato.
 */
export const FORM_LIMITS = {
  nome_solucao: 80,
  descricao_curta: 180,
  dor_e_evidencia: 2000,
  publico_alvo: 600,
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

/** Valida mínimos no payload já sanitizado (pós-clamp). */
export function validarFormSanitizado(form: FormSimplificado): keyof FormSimplificado | null {
  if (form.nome_solucao.length < 2) return 'nome_solucao';
  if (form.descricao_curta.length < 10) return 'descricao_curta';
  if (form.dor_e_evidencia.length < 20) return 'dor_e_evidencia';
  if (form.publico_alvo.length < 5) return 'publico_alvo';
  if (form.diferencial_moat.length < 10) return 'diferencial_moat';
  if (form.concorrentes.length < 3) return 'concorrentes';
  if (form.tam_aproximado.length < 1) return 'tam_aproximado';
  return null;
}
