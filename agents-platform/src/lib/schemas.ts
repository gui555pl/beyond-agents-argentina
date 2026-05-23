/**
 * Schemas Zod para validação dos endpoints públicos do servidor.
 *
 * `FormSimplificadoSchema` valida o body do `POST /api/submissions` —
 * é a visão "enxuta" que o usuário vê na tela `/submit`. Por baixo dos
 * panos, o `SubmissionExpander` mescla com defaults por vertical pra
 * gerar a `SubmissaoAurora` completa que o pipeline consome.
 */
import { z } from 'zod';

export const VerticalEnum = z.enum(['legaltech', 'edtech', 'healthtech', 'govtech', 'outra']);
export type Vertical = z.infer<typeof VerticalEnum>;

export const TempoTrabalhoEnum = z.enum([
  'menos-1m',
  '1-3m',
  '3-6m',
  '6m-1y',
  'mais-1y',
]);
export type TempoTrabalho = z.infer<typeof TempoTrabalhoEnum>;

/**
 * Form simplificado — 12 campos visíveis na tela /submit.
 *
 * Campos 1-9 são obrigatórios (validação client-side e server-side).
 * Email e founder são opcionais. Tempo de trabalho tem default '6m-1y'.
 */
export const FormSimplificadoSchema = z.object({
  // 1. Nome da solução
  nome_solucao: z.string().trim().min(2).max(80),
  // 2. Vertical
  vertical: VerticalEnum,
  // 3. Em 1 frase
  descricao_curta: z.string().trim().min(10).max(180),
  // 4. Dor + evidência
  dor_e_evidencia: z.string().trim().min(20).max(2000),
  // 5. Pra quem é
  publico_alvo: z.string().trim().min(5).max(300),
  // 6. Diferencial / moat
  diferencial_moat: z.string().trim().min(10).max(800),
  // 7. Concorrentes
  concorrentes: z.string().trim().min(3).max(600),
  // 8. TAM aproximado
  tam_aproximado: z.string().trim().min(1).max(300),
  // 9. Barreira legal imediata?
  barreira_legal_imediata: z.boolean(),
  barreira_legal_detalhes: z.string().trim().max(800).optional(),
  // 10. Tempo trabalhando
  tempo_trabalhando: TempoTrabalhoEnum.default('6m-1y'),
  // 11. Background do founder
  founder_background: z.string().trim().max(1500).optional(),
  // 12. Email opcional
  email: z.string().trim().email().optional().or(z.literal('').transform(() => undefined)),
});

export type FormSimplificado = z.infer<typeof FormSimplificadoSchema>;

export const SubmissionRequestSchema = z.object({
  form_simplificado: FormSimplificadoSchema,
});

export type SubmissionRequest = z.infer<typeof SubmissionRequestSchema>;
