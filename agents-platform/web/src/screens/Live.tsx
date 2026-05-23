/**
 * Live — tela de execução. Header com KPIs do envelope da árvore + canvas
 * Aurora + painel direito com detalhes do nó selecionado.
 */
import { useStore } from '../lib/store';
import { cancelarRun } from '../lib/api';
import { Tree } from '../components/Tree';
import { SidePanel } from '../components/SidePanel';
import { EventLog } from '../components/EventLog';
import { PipelineStepper } from '../components/PipelineStepper';

const VERTICAL_BADGE: Record<string, { bg: string; text: string }> = {
  healthtech: { bg: 'bg-vertical-health/15', text: 'text-vertical-health' },
  govtech: { bg: 'bg-vertical-gov/15', text: 'text-vertical-gov' },
  legaltech: { bg: 'bg-vertical-legal/15', text: 'text-vertical-legal' },
  edtech: { bg: 'bg-vertical-ed/15', text: 'text-vertical-ed' },
  outra: { bg: 'bg-surface-strong', text: 'text-body-strong' },
};

export function Live() {
  const nos = useStore((s) => Object.values(s.nos));
  const runId = useStore((s) => s.runId);
  const fase = useStore((s) => s.fase);
  const submissao = useStore((s) => s.submissao);
  const resetar = useStore((s) => s.reset);

  const personasTotal = nos.reduce((acc, n) => acc + (n.swarm?.respostas.length ?? 0), 0);
  const vertical = submissao?.solucao.vertical ?? 'outra';
  const corVertical = VERTICAL_BADGE[vertical] ?? VERTICAL_BADGE.outra;

  const onCancelar = async () => {
    if (runId) await cancelarRun(runId);
    resetar();
  };

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex items-center justify-between border-b border-hairline px-8 py-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-caption-uppercase text-primary-light">
              Beyond Agents · {fase === 'fim' ? 'execução concluída' : 'execução ao vivo'}
            </p>
            <h1 className="mt-1 flex items-center gap-3 text-title-md text-ink">
              <span>{submissao?.solucao.nome ?? '—'}</span>
              <span
                className={`rounded-pill px-2.5 py-0.5 text-caption-uppercase ${corVertical.bg} ${corVertical.text}`}
              >
                {vertical}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Indicador rotulo="nós" valor={nos.length.toString()} />
          <Indicador rotulo="LPs" valor={nos.filter((n) => n.lp).length.toString()} />
          <Indicador rotulo="personas" valor={personasTotal.toString()} />
          <Indicador
            rotulo="podadas"
            valor={nos
              .filter((n) => n.estado === 'podada' || n.estado === 'timeout')
              .length.toString()}
          />
          <Indicador
            rotulo="promovidas"
            valor={nos.filter((n) => n.estado === 'promovida').length.toString()}
          />
          {fase === 'live' && (
            <button
              onClick={onCancelar}
              className="rounded-md border border-hairline-strong bg-surface-card px-3 py-1.5 text-button text-body-strong transition hover:border-danger/60 hover:text-ink"
            >
              Cancelar
            </button>
          )}
        </div>
      </header>

      <PipelineStepper />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-1 flex-col bg-canvas">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-0 bg-aurora-radial-soft" />
            <div className="relative h-full">
              <Tree />
            </div>
          </div>
          <EventLog />
        </main>
        <aside className="flex w-[440px] flex-col border-l border-hairline bg-canvas-soft">
          <SidePanel />
        </aside>
      </div>
    </div>
  );
}

function Indicador({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="text-caption-uppercase text-muted">{rotulo}</span>
      <span className="font-mono text-title-md text-ink">{valor}</span>
    </div>
  );
}
