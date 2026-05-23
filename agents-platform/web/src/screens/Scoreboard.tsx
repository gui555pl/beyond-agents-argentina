/**
 * Scoreboard — overlay final com top hipóteses, custo e tempo.
 *
 * Aplica linguagem Aurora: gradiente violet sutil de fundo, surface-card
 * com hairlines, journey-done (dourado) para destaque do #1, semantic-success
 * para o score final.
 */
import { useState } from 'react';
import { useStore } from '../lib/store';

export function Scoreboard() {
  const ranking = useStore((s) => s.ranking);
  const nos = useStore((s) => s.nos);
  const custoTotal = useStore((s) => s.custoTotal);
  const custoPorAgente = useStore((s) => s.custoPorAgente);
  const duracaoMs = useStore((s) => s.duracaoMs);
  const reset = useStore((s) => s.reset);
  const [fechado, setFechado] = useState(false);

  if (fechado) return null;
  const top3 = ranking.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/95 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-aurora-radial" />
      <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl border border-hairline bg-canvas-soft p-10">
        <button
          onClick={() => setFechado(true)}
          className="absolute right-5 top-5 rounded-md border border-hairline-strong px-3 py-1.5 text-caption text-body hover:text-ink"
        >
          Inspecionar árvore ✕
        </button>

        <header>
          <p className="text-caption-uppercase text-primary-light">Beyond Agents · Aurora</p>
          <h1 className="mt-3 text-display-lg text-ink">Validação concluída</h1>
          <p className="mt-3 max-w-2xl text-body-md text-body">
            Resultado consolidado da exploração da árvore. Material pronto para o Comitê Aurora.
          </p>
        </header>

        <section className="mt-10 grid grid-cols-3 gap-4">
          <Kpi rotulo="Tempo de execução" valor={`${((duracaoMs ?? 0) / 1000).toFixed(1)}s`} />
          <Kpi
            rotulo="Custo total"
            valor={custoTotal ? `US$ ${custoTotal.cost_usd.toFixed(4)}` : '—'}
            destaque
          />
          <Kpi rotulo="Chamadas Claude" valor={(custoTotal?.calls ?? 0).toString()} />
        </section>

        <section className="mt-10">
          <h2 className="text-display-sm text-ink">Top hipóteses</h2>
          {top3.length === 0 ? (
            <p className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-4 text-body-sm text-warning">
              Toda a árvore foi podada — nenhuma hipótese atingiu critério de promoção.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {top3.map((r, i) => {
                const no = nos[r.no_id];
                if (!no) return null;
                return <RankingCard key={r.no_id} no={no} score={r.score_final} posicao={i + 1} />;
              })}
            </div>
          )}
        </section>

        {custoPorAgente && (
          <section className="mt-10">
            <h2 className="text-display-sm text-ink">Custo por agente</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-hairline">
              <table className="w-full text-body-sm">
                <thead className="bg-surface-card text-caption-uppercase text-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Agente</th>
                    <th className="px-4 py-3 text-right">Chamadas</th>
                    <th className="px-4 py-3 text-right">Tokens in</th>
                    <th className="px-4 py-3 text-right">Tokens out</th>
                    <th className="px-4 py-3 text-right">USD</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(custoPorAgente).map(([agente, c]) => (
                    <tr key={agente} className="border-t border-hairline text-body-strong">
                      <td className="px-4 py-3 font-mono text-caption text-ink">{agente}</td>
                      <td className="px-4 py-3 text-right">{c.calls}</td>
                      <td className="px-4 py-3 text-right">{c.input_tokens.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right">{c.output_tokens.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right text-success">
                        ${c.cost_usd.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <footer className="mt-10 flex items-center justify-between">
          <button
            onClick={reset}
            className="rounded-md bg-primary px-7 py-3 text-button text-on-primary transition hover:bg-primary-active"
          >
            Nova validação
          </button>
          <button
            onClick={() => setFechado(true)}
            className="text-caption text-body hover:text-ink"
          >
            Continuar inspecionando árvore →
          </button>
        </footer>
      </div>
    </div>
  );
}

function Kpi({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-5 ${
        destaque ? 'border-primary/40 bg-primary/5' : 'border-hairline bg-surface-card'
      }`}
    >
      <div className="text-caption-uppercase text-muted">{rotulo}</div>
      <div className={`mt-2 text-display-md ${destaque ? 'text-primary-light' : 'text-ink'}`}>
        {valor}
      </div>
    </div>
  );
}

function RankingCard({
  no,
  score,
  posicao,
}: {
  no: import('../lib/tipos').No;
  score: number;
  posicao: number;
}) {
  const corBorda =
    posicao === 1
      ? 'border-journey-done ring-1 ring-journey-done/30'
      : posicao === 2
        ? 'border-hairline-strong'
        : 'border-hairline';
  const m = no.performance;
  return (
    <div className={`rounded-lg border ${corBorda} bg-surface-card p-5`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-caption text-muted">{no.id}</span>
        <span
          className={`text-caption-uppercase ${posicao === 1 ? 'text-journey-done' : 'text-body-strong'}`}
        >
          #{posicao}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-title-sm text-ink">{no.hipotese.titulo}</h3>
      <p className="mt-1 line-clamp-2 text-caption text-body">{no.hipotese.publico_alvo}</p>

      {no.lp && (
        <div className="mt-4 h-32 overflow-hidden rounded-md border border-hairline bg-white">
          <iframe
            title={`LP ${no.id}`}
            srcDoc={no.lp.html}
            sandbox=""
            className="h-[800px] w-[1600px] origin-top-left scale-[0.20]"
            style={{ width: '500%', height: '500%' }}
          />
        </div>
      )}

      <div className="mt-4 border-t border-hairline-soft pt-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-caption-uppercase text-muted">Score final</div>
            <div className="mt-1 text-display-sm text-success">{score.toFixed(1)}</div>
          </div>
          {no.validador && (
            <div className="text-right">
              <div className="text-caption-uppercase text-muted">Aurora</div>
              <div className="text-title-sm text-body-strong">
                {no.validador.score_parcial_fit.toFixed(1)}
              </div>
            </div>
          )}
        </div>
        {m && (
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <Mini rotulo="pagariam" valor={`${(m.taxa_pagaria * 100).toFixed(0)}%`} />
            <Mini rotulo="int. média" valor={m.intencao_media.toFixed(1)} />
            <Mini rotulo="sean-ellis" valor={`${(m.sean_ellis_proxy * 100).toFixed(0)}%`} />
          </div>
        )}
      </div>
    </div>
  );
}

function Mini({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-sm border border-hairline-soft bg-canvas-soft px-1.5 py-1 text-center">
      <div className="text-[10px] text-muted">{rotulo}</div>
      <div className="font-mono text-caption text-ink">{valor}</div>
    </div>
  );
}
