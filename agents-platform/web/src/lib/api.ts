import type { FixtureRes } from './tipos';

export async function getFixture(): Promise<FixtureRes> {
  const r = await fetch('/api/fixture');
  if (!r.ok) throw new Error(`fixture http ${r.status}`);
  return (await r.json()) as FixtureRes;
}

export async function iniciarRun(body?: {
  submissao_aurora?: FixtureRes['submissao_aurora'];
  hipotese_raiz?: string;
}): Promise<{ runId: string }> {
  const r = await fetch('/api/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!r.ok) {
    const erro = (await r.json().catch(() => ({}))) as { erro?: string };
    throw new Error(erro.erro ?? `http ${r.status}`);
  }
  return (await r.json()) as { runId: string };
}

export async function cancelarRun(runId: string): Promise<void> {
  await fetch(`/api/runs/${runId}`, { method: 'DELETE' });
}
