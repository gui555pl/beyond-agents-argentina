/**
 * NodeCard — card de nó dentro do React Flow.
 *
 * Linguagem visual Aurora: surface-card sobre canvas, hairlines de 1px,
 * estados ativos puxam tom violet (Aurora primary). Sem drop shadows pesadas.
 */
import { Handle, Position, type NodeProps } from 'reactflow';
import type { No } from '../lib/tipos';

const ESTADOS: Record<
  No['estado'],
  { borda: string; fundo: string; rotulo: string; etiqueta: string; pulsar?: boolean }
> = {
  pendente: {
    borda: 'border-hairline',
    fundo: 'bg-surface-card',
    rotulo: 'text-muted',
    etiqueta: 'pendente',
    pulsar: true,
  },
  gerando: {
    borda: 'border-primary/50',
    fundo: 'bg-surface-card',
    rotulo: 'text-primary-light',
    etiqueta: 'gerando',
    pulsar: true,
  },
  validando: {
    borda: 'border-primary/60',
    fundo: 'bg-surface-card',
    rotulo: 'text-primary-light',
    etiqueta: 'validando',
    pulsar: true,
  },
  deployada: {
    borda: 'border-primary',
    fundo: 'bg-surface-card',
    rotulo: 'text-primary-light',
    etiqueta: 'swarm rodando',
    pulsar: true,
  },
  aprovada: {
    borda: 'border-success/70',
    fundo: 'bg-surface-card',
    rotulo: 'text-success',
    etiqueta: 'aprovada',
  },
  refinando: {
    borda: 'border-journey-build/70',
    fundo: 'bg-surface-card',
    rotulo: 'text-journey-build',
    etiqueta: 'refinando',
  },
  podada: {
    borda: 'border-danger/50',
    fundo: 'bg-surface-card opacity-70',
    rotulo: 'text-danger',
    etiqueta: 'podada',
  },
  timeout: {
    borda: 'border-danger/50',
    fundo: 'bg-surface-card opacity-70',
    rotulo: 'text-danger',
    etiqueta: 'timeout',
  },
  promovida: {
    borda: 'border-journey-done',
    fundo: 'bg-surface-card',
    rotulo: 'text-journey-done',
    etiqueta: 'promovida',
  },
};

function corScore(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-journey-done';
  return 'text-danger';
}

export interface NodeCardData {
  no: No;
  selecionado: boolean;
}

export function NodeCard({ data }: NodeProps<NodeCardData>) {
  const { no, selecionado } = data;
  const estado = ESTADOS[no.estado] ?? ESTADOS.pendente;

  return (
    <div
      className={`animate-fade-in w-72 cursor-pointer rounded-lg border ${estado.borda} ${estado.fundo} p-5 transition ${
        selecionado ? 'ring-2 ring-primary ring-offset-2 ring-offset-canvas' : ''
      } ${estado.pulsar ? 'animate-pulse-soft' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted" />
      <Handle type="source" position={Position.Bottom} className="!bg-muted" />

      <div className="flex items-center justify-between">
        <span className="font-mono text-caption text-muted">{no.id}</span>
        <span className={`text-caption-uppercase ${estado.rotulo}`}>{estado.etiqueta}</span>
      </div>

      <div className="mt-3 line-clamp-2 text-title-sm text-ink">{no.hipotese.titulo}</div>
      <div className="mt-1 line-clamp-1 text-caption text-body">{no.hipotese.publico_alvo}</div>

      {no.validador && (
        <div className="mt-3 flex items-center gap-2 text-caption">
          <span className="text-muted">Aurora</span>
          <span className={`text-title-sm ${corScore(no.validador.score_parcial_fit)}`}>
            {no.validador.score_parcial_fit.toFixed(0)}
          </span>
          {no.validador.veto && (
            <span className="rounded-pill bg-danger/15 px-2 py-0.5 text-[10px] font-semibold text-danger">
              VETO
            </span>
          )}
        </div>
      )}

      {no.performance && (
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <Mini
            rotulo="pagariam"
            valor={`${(no.performance.taxa_pagaria * 100).toFixed(0)}%`}
            dica="% das personas que pagariam pelo produto"
          />
          <Mini
            rotulo="int. média"
            valor={`${no.performance.intencao_media.toFixed(1)}`}
            dica="Intenção de compra média (0–10)"
          />
          <Mini
            rotulo="sean-ellis"
            valor={`${(no.performance.sean_ellis_proxy * 100).toFixed(0)}%`}
            dica="% com intenção ≥ 8 — proxy de 'muito decepcionado se faltasse'"
          />
        </div>
      )}

      {no.score_final != null && (
        <div className="mt-3 border-t border-hairline-soft pt-3 text-center">
          <div className="text-caption-uppercase text-muted">Score final</div>
          <div className={`mt-1 text-display-sm ${corScore(no.score_final)}`}>
            {no.score_final.toFixed(1)}
          </div>
        </div>
      )}
    </div>
  );
}

function Mini({ rotulo, valor, dica }: { rotulo: string; valor: string; dica?: string }) {
  return (
    <div
      className="rounded-sm border border-hairline-soft bg-canvas-soft px-1.5 py-1 text-center"
      title={dica}
    >
      <div className="text-[10px] text-muted">{rotulo}</div>
      <div className="font-mono text-caption text-ink">{valor}</div>
    </div>
  );
}
