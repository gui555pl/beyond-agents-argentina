/**
 * Home — landing pré-execução. Aplica o design Aurora:
 * canvas escuro + Aurora Violet em um único CTA + display weight 500.
 */
import { useEffect, useState } from 'react';
import { getFixture, iniciarRun } from '../lib/api';
import { useStore } from '../lib/store';
import type { FixtureRes } from '../lib/tipos';

const VERTICAL_BADGE: Record<string, { bg: string; ring: string; text: string }> = {
  healthtech: { bg: 'bg-vertical-health/15', ring: 'ring-vertical-health/30', text: 'text-vertical-health' },
  govtech: { bg: 'bg-vertical-gov/15', ring: 'ring-vertical-gov/30', text: 'text-vertical-gov' },
  legaltech: { bg: 'bg-vertical-legal/15', ring: 'ring-vertical-legal/30', text: 'text-vertical-legal' },
  edtech: { bg: 'bg-vertical-ed/15', ring: 'ring-vertical-ed/30', text: 'text-vertical-ed' },
  outra: { bg: 'bg-surface-strong', ring: 'ring-hairline-strong', text: 'text-body-strong' },
};

export function Home() {
  const [fixture, setFixture] = useState<FixtureRes | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const erroStore = useStore((s) => s.erro);
  const iniciar = useStore((s) => s.iniciarRun);

  useEffect(() => {
    getFixture()
      .then(setFixture)
      .catch((err: Error) => setErroLocal(err.message));
  }, []);

  const onIniciar = async () => {
    if (!fixture) return;
    setCarregando(true);
    setErroLocal(null);
    try {
      const { runId } = await iniciarRun();
      iniciar(runId, fixture.submissao_aurora, fixture.hipotese_raiz);
    } catch (err) {
      setErroLocal(err instanceof Error ? err.message : String(err));
    } finally {
      setCarregando(false);
    }
  };

  if (!fixture && !erroLocal) {
    return <div className="flex h-full items-center justify-center text-body">Carregando…</div>;
  }
  if (erroLocal || erroStore) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="max-w-xl rounded-lg border border-danger/40 bg-danger/10 p-6 text-ink">
          <h2 className="text-title-md">Erro</h2>
          <p className="mt-2 text-body-sm text-body-strong">{erroLocal ?? erroStore}</p>
        </div>
      </div>
    );
  }
  if (!fixture) return null;

  const { submissao_aurora: sub, hipotese_raiz } = fixture;
  const verticalCor = VERTICAL_BADGE[sub.solucao.vertical] ?? VERTICAL_BADGE.outra;

  return (
    <div className="relative h-full overflow-y-auto bg-canvas">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-aurora-radial" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-10 pb-20 pt-16">
        <header className="max-w-3xl">
          <p className="text-caption-uppercase text-primary-light">Beyond Agents · Aurora</p>
          <h1 className="mt-4 text-display-lg text-ink">Autovalidador de Ideias</h1>
          <p className="mt-4 text-body-md text-body">
            Pipeline agêntico que valida uma hipótese de negócio em minutos: gera LPs, anúncios e
            submete a um swarm de personas sintéticas. Devolve um score multivariável e material
            pronto para o Comitê Aurora.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <section className="md:col-span-2 space-y-6">
            <Bloco titulo="Solução">
              <Linha rotulo="Nome">{sub.solucao.nome}</Linha>
              <Linha rotulo="Descrição">{sub.solucao.descricao_50_chars}</Linha>
              <Linha rotulo="Vertical">
                <span
                  className={`inline-flex items-center rounded-pill ${verticalCor.bg} px-3 py-1 text-caption-uppercase ${verticalCor.text} ring-1 ${verticalCor.ring}`}
                >
                  {sub.solucao.vertical}
                </span>
              </Linha>
              <Linha rotulo="Por que essa ideia">{sub.solucao.por_que_escolheu}</Linha>
            </Bloco>

            <Bloco titulo="Founders">
              {sub.founders.map((f, i) => (
                <div
                  key={i}
                  className="border-b border-hairline-soft py-3 last:border-b-0 first:pt-0"
                >
                  <div className="text-title-sm text-ink">{f.nome}</div>
                  <div className="mt-1 text-caption text-muted">{f.educacao}</div>
                  <div className="mt-1 text-caption text-body">{f.historico_trabalho}</div>
                </div>
              ))}
            </Bloco>

            <Bloco titulo="Problema & mercado">
              <Linha rotulo="Público">{sub.problema_mercado.publico_problema_solucao}</Linha>
              <Linha rotulo="Dor">{sub.problema_mercado.dor_latente_e_evidencias}</Linha>
              <Linha rotulo="TAM/SAM/SOM">{sub.problema_mercado.tam_sam_som}</Linha>
              <Linha rotulo="Moat">{sub.problema_mercado.diferencial_moat}</Linha>
            </Bloco>

            <Bloco titulo="Progresso">
              <Linha rotulo="Tempo">{sub.progresso.tempo_de_trabalho}</Linha>
              <Linha rotulo="Caixa">{sub.progresso.cash_balance_e_burn_rate}</Linha>
              <Linha rotulo="Stack">{sub.progresso.stack_tecnologico}</Linha>
            </Bloco>
          </section>

          <aside className="space-y-6">
            <div className="rounded-lg border border-hairline bg-surface-card p-6">
              <p className="text-caption-uppercase text-muted">Hipótese raiz</p>
              <p className="mt-3 text-body-md text-ink">{hipotese_raiz}</p>
            </div>

            <div className="rounded-lg border border-hairline bg-surface-card p-6">
              <p className="text-caption-uppercase text-muted">O que acontece em seguida</p>
              <ol className="mt-4 space-y-3 text-body-sm text-body-strong">
                <PassoFluxo n={1} agente="Buscador" descricao="valida concorrentes e mercado" />
                <PassoFluxo n={2} agente="Validador Aurora" descricao="aplica o scorecard (16 critérios)" />
                <PassoFluxo n={3} agente="Criador" descricao="gera LP + 3 anúncios" />
                <PassoFluxo n={4} agente="Swarm" descricao="12 personas sintéticas em paralelo" />
                <PassoFluxo n={5} agente="Performance" descricao="agrega métricas e devolve veredito" />
                <PassoFluxo n={6} agente="Orquestrador" descricao="decide expandir / refinar / podar / promover" />
              </ol>
            </div>

            <button
              onClick={onIniciar}
              disabled={carregando}
              className="w-full rounded-md bg-primary px-7 py-3.5 text-button text-on-primary transition hover:bg-primary-active disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? 'Iniciando…' : 'Iniciar validação'}
            </button>
            <p className="text-center text-caption text-muted">
              Roda ao vivo · tempo estimado 1–3 minutos
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-card p-6">
      <h3 className="text-caption-uppercase text-muted">{titulo}</h3>
      <div className="mt-4 space-y-3 text-body-sm">{children}</div>
    </div>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4">
      <span className="text-caption text-muted">{rotulo}</span>
      <span className="text-body-sm text-body-strong">{children}</span>
    </div>
  );
}

function PassoFluxo({ n, agente, descricao }: { n: number; agente: string; descricao: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-pill bg-primary/15 text-[10px] font-semibold text-primary-light">
        {n}
      </span>
      <span>
        <span className="text-ink">{agente}</span>
        <span className="text-body"> · {descricao}</span>
      </span>
    </li>
  );
}
