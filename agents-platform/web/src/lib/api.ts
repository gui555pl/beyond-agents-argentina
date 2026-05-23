import type {
  FixtureRes,
  FormSimplificado,
  SubmissionRespostaApi,
  SubmissionInfo,
  Vertical,
} from './tipos';
import { sanitizarFormParaEnvio } from './form-limits';

/** URL pública do backend em produção (Render). Fallback se VITE_API_URL não entrar no build. */
const API_PROD_FALLBACK = 'https://beyond-agents-api.onrender.com';

/**
 * Base URL da API.
 * - Dev: vazia → proxy do Vite (vite.config.ts → localhost:4001).
 * - Prod: VITE_API_URL no Vercel, ou fallback hardcoded acima.
 */
export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? API_PROD_FALLBACK : '')
).replace(/\/+$/, '');

/** Parseia JSON com mensagem clara quando o servidor devolve HTML (ex.: rewrite SPA). */
async function parseJson<T>(r: Response, contexto: string): Promise<T> {
  const ct = r.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) {
    const amostra = (await r.text()).slice(0, 80).replace(/\s+/g, ' ');
    throw new Error(
      `${contexto}: resposta inválida (HTTP ${r.status}). Esperava JSON, recebeu "${amostra}…". ` +
        `API_BASE=${API_BASE || '(vazio — proxy local)'}`,
    );
  }
  return (await r.json()) as T;
}

/** Pinga /api/health para acordar cold start do Render antes do submit. */
export async function aquecerBackend(timeoutMs = 25_000): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${API_BASE}/api/health`, { signal: ctrl.signal });
    return r.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function getFixture(vertical?: Vertical | 'healthtech' | 'edtech'): Promise<FixtureRes> {
  const url = vertical ? `${API_BASE}/api/fixture?vertical=${vertical}` : `${API_BASE}/api/fixture`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fixture http ${r.status}`);
  return parseJson<FixtureRes>(r, 'getFixture');
}

/** Submete o form simplificado e devolve a submissão + runId. */
export async function submitForm(form: FormSimplificado): Promise<SubmissionRespostaApi> {
  const payload = sanitizarFormParaEnvio(form);
  const r = await fetch(`${API_BASE}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ form_simplificado: payload }),
  });
  if (!r.ok) {
    const erro = await parseJson<{ erro?: string; detalhes?: unknown }>(r, 'submitForm').catch(() => ({
      erro: `http ${r.status}`,
      detalhes: undefined,
    }));
    const msg = erro.erro ?? `http ${r.status}`;
    if (r.status === 429) {
      throw new Error(
        msg ||
          'Muitas submissões em sequência — aguarde ~1 minuto ou use /presenter para disparo direto.',
      );
    }
    if (r.status === 400) {
      throw new Error(msg || 'Form inválido — confira os campos e tente de novo.');
    }
    throw new Error(erro.detalhes ? `${msg}: ${JSON.stringify(erro.detalhes)}` : msg);
  }
  return parseJson<SubmissionRespostaApi>(r, 'submitForm');
}

/** Busca os dados de uma submissão por submissionId OU runId. */
export async function getSubmissionInfo(idOrRunId: string): Promise<SubmissionInfo> {
  const r = await fetch(`${API_BASE}/api/submissions/${idOrRunId}`);
  if (!r.ok) throw new Error(`submission http ${r.status}`);
  return parseJson<SubmissionInfo>(r, 'getSubmissionInfo');
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
    const erro = await parseJson<{ erro?: string }>(r, 'iniciarRunLegacy').catch(() => ({ erro: `http ${r.status}` }));
    throw new Error(erro.erro ?? `http ${r.status}`);
  }
  return parseJson<{ runId: string; submissionId: string }>(r, 'iniciarRunLegacy');
}
