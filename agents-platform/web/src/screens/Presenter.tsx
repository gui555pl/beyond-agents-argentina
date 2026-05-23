/**
 * Presenter — modo apresentador. Página simples com 2 botões que disparam o
 * endpoint legacy `/api/runs` com a fixture pré-preenchida (Erudio ou MedFlow).
 *
 * Útil pra o apresentador rodar uma run polished sem digitar nada no pitch.
 * Após disparar, navega para `/runs/:runId`.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { iniciarRunLegacy } from '../lib/api';

export function Presenter() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState<'edtech' | 'healthtech' | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const disparar = async (vertical: 'edtech' | 'healthtech') => {
    setCarregando(vertical);
    setErro(null);
    try {
      const { runId } = await iniciarRunLegacy({ vertical });
      navigate(`/runs/${runId}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : String(err));
    } finally {
      setCarregando(null);
    }
  };

  return (
    <div className="relative flex h-full items-center justify-center bg-canvas px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-aurora-radial" />
      <div className="relative w-full max-w-2xl">
        <p className="text-caption-uppercase text-primary-light">Beyond Agents · Aurora</p>
        <h1 className="mt-3 text-display-lg text-ink">Modo apresentador</h1>
        <p className="mt-3 text-body-md text-body">
          Disparo direto da run com a submissão pré-carregada. Escolha qual caso usar como demo.
          A run aparece em <span className="font-mono text-ink">/runs/&lt;id&gt;</span> e pode ser
          compartilhada por link.
        </p>

        {erro && (
          <div className="mt-6 rounded-lg border border-danger/40 bg-danger/10 p-4 text-body-sm text-ink">
            {erro}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            onClick={() => disparar('edtech')}
            disabled={carregando !== null}
            className="rounded-lg border border-hairline bg-surface-card p-6 text-left transition hover:border-primary/60 disabled:opacity-50"
          >
            <p className="text-caption-uppercase text-vertical-ed">EdTech</p>
            <h2 className="mt-2 text-display-md text-ink">Erudio</h2>
            <p className="mt-2 text-body-sm text-body">
              Plataforma de gestão educacional com IA para hospitais-escola, universidades médias
              e áreas de SST corporativas.
            </p>
            <p className="mt-4 text-button text-primary-light">
              {carregando === 'edtech' ? 'Iniciando…' : 'Iniciar Erudio →'}
            </p>
          </button>

          <button
            onClick={() => disparar('healthtech')}
            disabled={carregando !== null}
            className="rounded-lg border border-hairline bg-surface-card p-6 text-left transition hover:border-primary/60 disabled:opacity-50"
          >
            <p className="text-caption-uppercase text-vertical-health">HealthTech</p>
            <h2 className="mt-2 text-display-md text-ink">MedFlow</h2>
            <p className="mt-2 text-body-sm text-body">
              Copiloto de IA para gestão de clínicas pequenas brasileiras com 1-10 médicos. Foco em
              no-show, triagem e prontuário.
            </p>
            <p className="mt-4 text-button text-primary-light">
              {carregando === 'healthtech' ? 'Iniciando…' : 'Iniciar MedFlow →'}
            </p>
          </button>
        </div>

        <button
          onClick={() => navigate('/submit')}
          className="mt-8 text-caption text-muted hover:text-ink"
        >
          ← Ir para o formulário público
        </button>
      </div>
    </div>
  );
}
