import type {
  FixtureRes,
  FormSimplificado,
  SubmissionRespostaApi,
  SubmissionInfo,
  Vertical,
} from './tipos';

/**
 * Base URL da API.
 * - Em dev: fica vazia → cai no proxy do Vite (vite.config.ts).
 * - Em prod (Vercel): setar VITE_API_URL com a URL do backend (ex: https://api.example.com).
 *
 * Trailing slashes são removidas para evitar `//api/...`.
 */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export async function getFixture(vertical?: Vertical | 'healthtech' | 'edtech'): Promise<FixtureRes> {
  const url = vertical ? `${API_BASE}/api/fixture?vertical=${vertical}` : `${API_BASE}/api/fixture`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fixture http ${r.status}`);
  return (await r.json()) as FixtureRes;
}

/** Submete o form simplificado e devolve a submissão + runId. */
export async function submitForm(form: FormSimplificado): Promise<SubmissionRespostaApi> {
  const r = await fetch(`${API_BASE}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ form_simplificado: form }),
  });
  if (!r.ok) {
    const erro = (await r.json().catch(() => ({}))) as { erro?: string };
    throw new Error(erro.erro ?? `http ${r.status}`);
  }
  return (await r.json()) as SubmissionRespostaApi;
}

/** Busca os dados de uma submissão por submissionId OU runId. */
export async function getSubmissionInfo(idOrRunId: string): Promise<SubmissionInfo> {
  const r = await fetch(`${API_BASE}/api/submissions/${idOrRunId}`);
  if (!r.ok) throw new Error(`submission http ${r.status}`);
  return (await r.json()) as SubmissionInfo;
}

export async function cancelarRun(runId: string): Promise<void> {
  await fetch(`${API_BASE}/api/runs/${runId}`, { method: 'DELETE' });
}

/** Endpoint legacy — dispara a fixture direto (apresentador). */
export async function iniciarRunLegacy(body?: {
  submissao_aurora?: FixtureRes['submissao_aurora'];
  hipotese_raiz?: string;
  vertical?: 'healthtech' | 'edtech';
}): Promise<{ runId: string; submissionId: string }> {
  const r = await fetch(`${API_BASE}/api/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!r.ok) {
    const erro = (await r.json().catch(() => ({}))) as { erro?: string };
    throw new Error(erro.erro ?? `http ${r.status}`);
  }
  return (await r.json()) as { runId: string; submissionId: string };
}
