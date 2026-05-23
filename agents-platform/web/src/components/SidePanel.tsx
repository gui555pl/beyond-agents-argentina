/**
 * Painel lateral — exibe detalhes do nó selecionado.
 *
 * Aplica linguagem Aurora: canvas + surface-card, hairlines, Aurora Violet
 * apenas em estados ativos, semantic-success/danger para resultado do swarm
 * e Aurora.
 *
 * Tabs: LP · Ads · Swarm · Métricas · Aurora.
 */
import { useState } from 'react';
import { useStore } from '../lib/store';
import type { No, RespostaPersona } from '../lib/tipos';
import { PreviewModal } from './PreviewModal';

type Tab = 'lp' | 'ads' | 'swarm' | 'metricas' | 'aurora' | 'analise';

const TABS: Array<{ id: Tab; rotulo: string }> = [
  { id: 'lp', rotulo: 'LP' },
  { id: 'ads', rotulo: 'Ads' },
  { id: 'swarm', rotulo: 'Swarm' },
  { id: 'metricas', rotulo: 'Métricas' },
  { id: 'aurora', rotulo: 'Aurora' },
  { id: 'analise', rotulo: 'Análise' },
];

export function SidePanel() {
  const selecionadoId = useStore((s) => s.selecionadoId);
  const no = useStore((s) => (selecionadoId ? s.nos[selecionadoId] : null));
  const [tab, setTab] = useState<Tab>('lp');

  if (!no) {
    return (
      <div className="flex h-full items-center justify-center px-6 py-10 text-center text-body-sm text-muted">
        Selecione um nó para inspecionar LP, Ads, Swarm, Métricas e Aurora.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-hairline px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-caption text-muted">{no.id}</span>
          <span className="text-caption-uppercase text-primary-light">{no.estado}</span>
        </div>
        <h2 className="mt-2 text-title-md text-ink">{no.hipotese.titulo}</h2>
        <p className="mt-1 text-caption text-body">{no.hipotese.publico_alvo}</p>
      </header>

      <nav className="flex border-b border-hairline">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-3 text-caption-uppercase transition ${
              tab === t.id
                ? 'border-b-2 border-primary text-ink'
                : 'text-muted hover:text-body-strong'
            }`}
          >
            {t.rotulo}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-auto">
        {tab === 'lp' && <TabLP no={no} />}
        {tab === 'ads' && <TabAds no={no} />}
        {tab === 'swarm' && <TabSwarm no={no} />}
        {tab === 'metricas' && <TabMetricas no={no} />}
        {tab === 'aurora' && <TabAurora no={no} />}
        {tab === 'analise' && <TabAnalise no={no} />}
      </div>
    </div>
  );
}

function TabLP({ no }: { no: No }) {
  const [aberto, setAberto] = useState(false);
  if (!no.lp) return <Vazio>LP ainda não gerada para este nó.</Vazio>;

  return (
    <div className="flex h-full flex-col p-5">
      {/* Metadata */}
      <div className="rounded-lg border border-hairline bg-surface-card p-4">
        <div className="text-caption-uppercase text-muted">Landing page</div>
        <div className="mt-2 flex items-center gap-2 text-caption text-body">
          <span className="font-mono text-ink">{no.lp.lp_id}</span>
          <span className="text-muted">·</span>
          <span>{no.lp.angulo}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-caption">
          <div>
            <div className="text-muted">Headline</div>
            <div className="mt-1 line-clamp-3 text-body-strong">
              {no.hipotese.lp_headline_sugerida}
            </div>
          </div>
          <div>
            <div className="text-muted">CTA</div>
            <div className="mt-1 line-clamp-3 text-body-strong">
              {no.hipotese.lp_cta_sugerido}
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail clicável */}
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="group relative mt-5 overflow-hidden rounded-lg border border-hairline bg-white transition hover:border-primary"
      >
        <div className="h-[280px] w-full overflow-hidden">
          <iframe
            title={`Preview LP ${no.id}`}
            srcDoc={no.lp.html}
            sandbox=""
            tabIndex={-1}
            className="pointer-events-none origin-top-left scale-[0.30]"
            style={{ width: '1280px', height: '933px' }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-canvas/0 opacity-0 transition group-hover:bg-canvas/40 group-hover:opacity-100">
          <span className="rounded-md bg-primary px-4 py-2 text-button text-on-primary">
            Abrir em tela cheia
          </span>
        </div>
      </button>

      <p className="mt-3 text-caption text-muted">
        Preview reduzido · clique para abrir em tela cheia
      </p>

      <PreviewModal
        aberto={aberto}
        onClose={() => setAberto(false)}
        titulo={no.hipotese.lp_headline_sugerida}
        subtitulo={`${no.id} · ${no.lp.angulo}`}
      >
        <iframe
          title={`LP ${no.id}`}
          srcDoc={no.lp.html}
          className="h-full w-full bg-white"
          sandbox="allow-scripts"
        />
      </PreviewModal>
    </div>
  );
}

function TabAds({ no }: { no: No }) {
  const [aberto, setAberto] = useState(false);
  if (!no.ads) return <Vazio>Ads ainda não gerados.</Vazio>;

  const htmlAdsFull = `<!doctype html><html><head><meta charset="utf-8"/><script src="https://cdn.tailwindcss.com"></script><style>body{margin:0;padding:48px;background:#0a0a0f;font-family:Inter,system-ui;color:#f0efe8;min-height:100vh}.ads-grid{max-width:1100px;margin:0 auto}</style></head><body><div class="ads-grid">${no.ads.html}</div></body></html>`;

  // Card vertical compacto pra cada ad — formato mobile portrait.
  // O HTML do criador-ads vem como grid 3-colunas; vamos só listar os 3 ads
  // como mini-cards retrato, baseado no número de ads. Em vez de renderizar
  // o HTML inteiro (que estoura o painel), mostramos só uma referência
  // textual e o botão para abrir tudo em tela cheia.
  return (
    <div className="flex h-full flex-col p-5">
      <div className="rounded-lg border border-hairline bg-surface-card p-4">
        <div className="text-caption-uppercase text-muted">Anúncios</div>
        <div className="mt-2 text-caption text-body">
          <strong className="text-ink">{no.ads.qtd_ads}</strong> criativos gerados a partir da LP
          <span className="font-mono text-muted"> · {no.ads.lp_id}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAberto(true)}
        className="group relative mt-5 overflow-hidden rounded-lg border border-hairline bg-canvas-soft transition hover:border-primary"
      >
        <div className="h-[260px] w-full overflow-hidden">
          <iframe
            title={`Preview Ads ${no.id}`}
            srcDoc={htmlAdsFull}
            sandbox=""
            tabIndex={-1}
            className="pointer-events-none origin-top-left scale-[0.34]"
            style={{ width: '1180px', height: '760px' }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-canvas/0 opacity-0 transition group-hover:bg-canvas/40 group-hover:opacity-100">
          <span className="rounded-md bg-primary px-4 py-2 text-button text-on-primary">
            Ver criativos
          </span>
        </div>
      </button>

      <p className="mt-3 text-caption text-muted">
        Os 3 anúncios são gerados a partir do mesmo ângulo da LP · clique para ampliar
      </p>

      <PreviewModal
        aberto={aberto}
        onClose={() => setAberto(false)}
        titulo="Anúncios"
        subtitulo={`${no.id} · ${no.ads.qtd_ads} criativos`}
      >
        <iframe
          title={`Ads ${no.id}`}
          srcDoc={htmlAdsFull}
          className="h-full w-full bg-canvas"
          sandbox="allow-scripts"
        />
      </PreviewModal>
    </div>
  );
}

function TabSwarm({ no }: { no: No }) {
  const respostas = no.swarm?.respostas ?? [];
  const total = no.performance?.total_personas ?? respostas.length;
  const veredito = no.veredito_swarm;
  const corVeredito =
    veredito === 'aprovada'
      ? 'bg-success/15 text-success'
      : veredito === 'refinar'
        ? 'bg-journey-build/15 text-journey-build'
        : 'bg-danger/15 text-danger';

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-hairline px-5 py-3">
        <div className="flex items-center justify-between text-caption text-body">
          <span>
            Personas <strong className="text-ink">{respostas.length}</strong>
            <span className="text-muted"> / {total || '...'}</span>
          </span>
          {veredito && (
            <span className={`rounded-pill px-2.5 py-0.5 text-caption-uppercase ${corVeredito}`}>
              {veredito}
            </span>
          )}
        </div>
        {total > 0 && (
          <div className="mt-2 h-1 overflow-hidden rounded-pill bg-hairline">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (respostas.length / total) * 100)}%` }}
            />
          </div>
        )}
      </div>
      <ul className="flex-1 space-y-2.5 overflow-auto p-4">
        {respostas.length === 0 && <Vazio>Swarm ainda não começou.</Vazio>}
        {[...respostas].reverse().map((r, i) => (
          <PersonaCard key={`${r.persona_id}-${i}`} resposta={r} />
        ))}
      </ul>
    </div>
  );
}

function PersonaCard({ resposta }: { resposta: RespostaPersona }) {
  return (
    <li className="animate-slide-in rounded-lg border border-hairline bg-surface-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-title-sm text-ink">{resposta.nome}</div>
          <div className="truncate text-caption text-muted">{resposta.ocupacao}</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-pill px-2 py-0.5 text-[10px] font-semibold ${
              resposta.pagaria
                ? 'bg-success/15 text-success'
                : 'bg-surface-strong text-muted'
            }`}
          >
            {resposta.pagaria ? '✓ pagaria' : '✗ não pagaria'}
          </span>
          <span className="font-mono text-caption text-body-strong">
            {resposta.intencao_compra_0_a_10}/10
          </span>
        </div>
      </div>
      <p className="mt-3 text-caption text-body">"{resposta.feedback_qualitativo}"</p>
    </li>
  );
}

function TabMetricas({ no }: { no: No }) {
  const m = no.performance;
  if (!m) return <Vazio>Performance ainda não foi calculada.</Vazio>;
  return (
    <div className="space-y-5 p-5">
      <div className="rounded-lg border border-hairline bg-surface-card p-4">
        <div className="text-caption-uppercase text-muted">Score multivariável</div>
        <div className="mt-2 text-caption text-body">
          <span className="text-success">quanti</span> (pagariam + CTR) ·{' '}
          <span className="text-journey-scale">quali</span> (Sean-Ellis + intenção) ·{' '}
          <span className="text-journey-done">econ</span> (custo) ·{' '}
          <span className="text-primary-light">fit</span> (Aurora)
        </div>
      </div>

      <BarraMetrica
        rotulo="Pagariam (quanti)"
        valor={m.taxa_pagaria}
        cor="bg-success"
        dica="% das personas que disseram que pagariam"
      />
      <BarraMetrica
        rotulo="CTR sintético (quanti)"
        valor={m.ctr_sintetico}
        cor="bg-primary"
        dica="% das personas que clicariam no CTA"
      />
      <BarraMetrica
        rotulo="Intenção média (quali)"
        valor={m.intencao_media / 10}
        cor="bg-journey-scale"
        dica="Média da intenção de compra autodeclarada (0–10)"
      />
      <BarraMetrica
        rotulo="Sean-Ellis proxy (quali)"
        valor={m.sean_ellis_proxy}
        cor="bg-journey-done"
        dica="% com intenção ≥ 8 — proxy de 'muito decepcionado sem o produto'"
      />
      <BarraMetrica
        rotulo="Interessados (sinal)"
        valor={m.taxa_interessados}
        cor="bg-journey-build"
        dica="% que classificou a oferta como interessante"
      />

      <div className="rounded-lg border border-hairline bg-surface-card p-4">
        <div className="text-caption-uppercase text-muted">Veredito · performance</div>
        <div
          className={`mt-2 text-title-sm uppercase tracking-wide ${
            m.veredito === 'aprovada'
              ? 'text-success'
              : m.veredito === 'refinar'
                ? 'text-journey-build'
                : 'text-danger'
          }`}
        >
          {m.veredito}
        </div>
        <p className="mt-2 text-caption text-body">{m.motivo_veredito}</p>
      </div>

      {no.decisao && (
        <div className="rounded-lg border border-hairline bg-surface-card p-4">
          <div className="text-caption-uppercase text-muted">Decisão · orquestrador</div>
          <div className="mt-2 text-title-sm uppercase tracking-wide text-journey-done">
            {no.decisao.acao}
          </div>
          <p className="mt-2 text-caption text-body">{no.decisao.justificativa}</p>
        </div>
      )}
    </div>
  );
}

function BarraMetrica({
  rotulo,
  valor,
  cor,
  dica,
}: {
  rotulo: string;
  valor: number;
  cor: string;
  dica?: string;
}) {
  const pct = Math.max(0, Math.min(100, valor * 100));
  return (
    <div title={dica}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-caption text-body">{rotulo}</span>
        <span className="font-mono text-caption text-ink">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-pill bg-hairline">
        <div className={`h-full ${cor} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TabAurora({ no }: { no: No }) {
  const v = no.validador;
  if (!v) return <Vazio>Validador Aurora ainda não rodou.</Vazio>;
  const corScore =
    v.score_parcial_fit >= 80
      ? 'text-success'
      : v.score_parcial_fit >= 60
        ? 'text-journey-done'
        : 'text-danger';

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between rounded-lg border border-hairline bg-surface-card p-4">
        <div>
          <div className="text-caption-uppercase text-muted">Score parcial Aurora</div>
          <div className={`mt-1 text-display-md ${corScore}`}>{v.score_parcial_fit.toFixed(1)}</div>
        </div>
        <div className="text-right">
          <span className="rounded-pill bg-surface-strong px-2.5 py-1 text-caption-uppercase text-body-strong">
            {v.recomendacao_playbook}
          </span>
          {v.veto && (
            <div className="mt-2 rounded-pill bg-danger/15 px-2.5 py-1 text-caption-uppercase text-danger">
              VETO
            </div>
          )}
        </div>
      </div>

      {v.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {v.tags.map((t) => (
            <span
              key={t}
              className="rounded-pill border border-hairline bg-surface-strong px-2.5 py-0.5 text-[10px] text-body-strong"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {v.criterios.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-caption-uppercase text-muted">Critérios ({v.criterios.length})</div>
          {v.criterios.map((c) => (
            <details
              key={c.id}
              className="rounded-md border border-hairline-soft bg-canvas-soft p-2.5"
            >
              <summary className="flex cursor-pointer items-center justify-between text-caption text-body-strong">
                <span>{c.id}</span>
                <span
                  className={`font-mono ${c.nota >= 8 ? 'text-success' : c.nota >= 5 ? 'text-journey-done' : 'text-danger'}`}
                >
                  {c.nota}/10
                </span>
              </summary>
              <p className="mt-2 text-caption text-body">{c.justificativa}</p>
              <p className="mt-1 text-[10px] text-muted-soft">{c.fonte}</p>
            </details>
          ))}
        </div>
      )}

      {v.discrepancias_founder_vs_research &&
        v.discrepancias_founder_vs_research.length > 0 && (
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-4">
            <div className="text-title-sm text-warning">Discrepâncias founder × research</div>
            <ul className="mt-2 space-y-3 text-caption">
              {v.discrepancias_founder_vs_research.map((d, i) => (
                <li key={i}>
                  <div className="text-body">{d.campo}</div>
                  <div className="text-body-strong">F: {d.founder}</div>
                  <div className="text-body-strong">R: {d.research}</div>
                  <span
                    className={`mt-1 inline-block rounded-pill px-2 py-0.5 text-[10px] uppercase ${
                      d.severidade === 'alta'
                        ? 'bg-danger/15 text-danger'
                        : d.severidade === 'media'
                          ? 'bg-warning/15 text-warning'
                          : 'bg-surface-strong text-body-strong'
                    }`}
                  >
                    {d.severidade}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}

function TabAnalise({ no }: { no: No }) {
  const cg = no.copy_guide;
  if (!cg) {
    return (
      <Vazio>
        Copy Guide indisponível (Beatriz não rodou neste nó ou caiu no fallback determinístico).
      </Vazio>
    );
  }

  return (
    <div className="space-y-4 p-5">
      <Card titulo="ICP — Ideal Customer Profile">
        <Linha label="Demográfico">{cg.icp.demografico}</Linha>
        <Linha label="Psicográfico">{cg.icp.psicografico}</Linha>
        <Linha label="Nível de consciência" mono>
          {cg.icp.nivel_consciencia}
        </Linha>
      </Card>

      <Card titulo="JTBD — Jobs To Be Done">
        <Linha label="Funcional">{cg.jtbd.funcional}</Linha>
        <Linha label="Emocional">{cg.jtbd.emocional}</Linha>
        <Linha label="Social">{cg.jtbd.social}</Linha>
      </Card>

      <Card titulo="Value Proposition">
        <Linha label="Headline">{cg.value_proposition.headline}</Linha>
        <Linha label="Subhead">{cg.value_proposition.subheadline}</Linha>
        <Linha label="UVP única">{cg.value_proposition.uvp}</Linha>
      </Card>

      <Card titulo="Tom de voz">
        <Linha label="Personalidade">{cg.tone_of_voice.personalidade}</Linha>
        <Linha label="Register" mono>
          {cg.tone_of_voice.register}
        </Linha>
        {cg.tone_of_voice.dos.length > 0 && (
          <Lista label="Faça" itens={cg.tone_of_voice.dos} cor="text-success" />
        )}
        {cg.tone_of_voice.donts.length > 0 && (
          <Lista label="Não faça" itens={cg.tone_of_voice.donts} cor="text-danger" />
        )}
      </Card>

      <Card titulo="Pain — Gain">
        {cg.pain_gain.dores.length > 0 && (
          <Lista label="Dores" itens={cg.pain_gain.dores} cor="text-danger" />
        )}
        {cg.pain_gain.ganhos.length > 0 && (
          <Lista label="Ganhos" itens={cg.pain_gain.ganhos} cor="text-success" />
        )}
      </Card>

      <Card titulo="PAS — Problem, Agitation, Solution">
        <Linha label="Problema">{cg.pas.problema}</Linha>
        <Linha label="Agitação">{cg.pas.agitacao}</Linha>
        <Linha label="Solução">{cg.pas.solucao}</Linha>
      </Card>

      <p className="px-1 text-caption text-muted-soft">
        Copy Guide produzido pela Beatriz na raiz da árvore e compartilhado com este nó como
        contexto pro Leandro LP.
      </p>
    </div>
  );
}

function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-card p-4">
      <div className="text-caption-uppercase text-muted">{titulo}</div>
      <div className="mt-3 space-y-2.5 text-caption">{children}</div>
    </div>
  );
}

function Linha({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-caption-uppercase text-muted-soft">{label}</div>
      <div className={`mt-1 text-body-strong ${mono ? 'font-mono text-ink' : ''}`}>{children}</div>
    </div>
  );
}

function Lista({ label, itens, cor }: { label: string; itens: string[]; cor: string }) {
  return (
    <div>
      <div className="text-caption-uppercase text-muted-soft">{label}</div>
      <ul className="mt-1 space-y-1">
        {itens.map((it, i) => (
          <li key={i} className={`text-body-strong ${cor}/90`}>
            · {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Vazio({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center px-6 py-10 text-center text-caption text-muted">
      {children}
    </div>
  );
}
