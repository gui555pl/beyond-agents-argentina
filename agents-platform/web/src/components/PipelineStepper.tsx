/**
 * Pipeline Stepper — faixa horizontal mostrando os 7 agentes da arquitetura
 * Beyond Agents (§3 do plano de arquitetura) sob a supervisão visual do
 * Orquestrador.
 *
 * A etapa "ativa" é inferida pelo último evento recebido no store. O
 * Orquestrador é a moldura: ele é sempre o supervisor — quando o último
 * evento é `orquestrador_decidiu`, sinaliza brilho na moldura inteira.
 *
 * Linguagem Aurora: surface-card sobre canvas, hairline, Aurora Violet no
 * pulso da etapa atual, journey-pills só como marcador discreto de cada
 * etapa.
 */
import { useMemo } from 'react';
import { useStore } from '../lib/store';
import type { EventoPipeline } from '../lib/tipos';

type EtapaId =
  | 'buscador'
  | 'validador'
  | 'criador'
  | 'trafego'
  | 'swarm'
  | 'performance';

interface Etapa {
  id: EtapaId;
  ordem: number;
  rotulo: string;
  descricao: string;
}

const ETAPAS: Etapa[] = [
  { id: 'buscador', ordem: 1, rotulo: 'Benchmark', descricao: 'contexto de mercado' },
  { id: 'validador', ordem: 2, rotulo: 'Validador Aurora', descricao: '16 critérios + VETO' },
  { id: 'criador', ordem: 3, rotulo: 'LLP', descricao: 'landing page + 3 ads' },
  { id: 'trafego', ordem: 4, rotulo: 'Gestor de Tráfego', descricao: 'handoff LP → swarm' },
  { id: 'swarm', ordem: 5, rotulo: 'Swarm', descricao: 'personas em paralelo' },
  { id: 'performance', ordem: 6, rotulo: 'Performance', descricao: 'métricas + veredito' },
];

/**
 * Mapeia o último evento conhecido para a etapa "em foco" no stepper.
 * `orquestrador_decidiu` não é uma etapa por si, mas faz o frame inteiro
 * pulsar (porque o Orquestrador é a moldura).
 */
function etapaPorUltimoEvento(evt: EventoPipeline | undefined): {
  ativaOrdem: number;
  orquestradorPulsando: boolean;
} {
  if (!evt) return { ativaOrdem: 0, orquestradorPulsando: false };
  switch (evt.tipo) {
    case 'no_criado':
      return { ativaOrdem: 1, orquestradorPulsando: true };
    case 'buscador_pronto':
      return { ativaOrdem: 1, orquestradorPulsando: false };
    case 'validador_pronto':
      return { ativaOrdem: 2, orquestradorPulsando: false };
    case 'lp_pronta':
    case 'ads_prontos':
      return { ativaOrdem: 3, orquestradorPulsando: false };
    case 'trafego_disparado':
      return { ativaOrdem: 4, orquestradorPulsando: false };
    case 'persona_respondeu':
      return { ativaOrdem: 5, orquestradorPulsando: false };
    case 'performance_pronta':
      return { ativaOrdem: 6, orquestradorPulsando: false };
    case 'orquestrador_decidiu':
      return { ativaOrdem: 6, orquestradorPulsando: true };
    case 'estado_mudou':
      // Mapeamento de estado → etapa
      if (evt.estado === 'validando') return { ativaOrdem: 1, orquestradorPulsando: false };
      if (evt.estado === 'gerando') return { ativaOrdem: 3, orquestradorPulsando: false };
      if (evt.estado === 'deployada') return { ativaOrdem: 4, orquestradorPulsando: false };
      return { ativaOrdem: 0, orquestradorPulsando: true };
    case 'no_finalizado':
    case 'pipeline_finalizado':
      return { ativaOrdem: 6, orquestradorPulsando: false };
    default:
      return { ativaOrdem: 0, orquestradorPulsando: false };
  }
}

export function PipelineStepper() {
  const eventos = useStore((s) => s.eventos);
  const ultimoEvento = eventos[eventos.length - 1];

  const { ativaOrdem, orquestradorPulsando } = useMemo(
    () => etapaPorUltimoEvento(ultimoEvento),
    [ultimoEvento],
  );

  return (
    <div
      className={`border-b border-hairline bg-canvas-soft px-4 py-3 md:px-8 ${
        orquestradorPulsando ? 'ring-1 ring-inset ring-primary/40' : ''
      }`}
    >
      <div className="flex items-center gap-4 md:justify-between">
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`h-2 w-2 rounded-pill ${
              orquestradorPulsando ? 'bg-primary animate-pulse-soft' : 'bg-primary/40'
            }`}
          />
          <div>
            <div className="text-caption-uppercase text-primary-light">Orquestrador</div>
            <div className="hidden text-caption text-muted sm:block">supervisionando</div>
          </div>
        </div>

        <ol className="flex flex-1 items-center justify-end gap-1 overflow-x-auto whitespace-nowrap">
          {ETAPAS.map((etapa, i) => {
            const ehAtiva = etapa.ordem === ativaOrdem;
            const jaPassou = etapa.ordem < ativaOrdem;
            return (
              <li key={etapa.id} className="flex shrink-0 items-center">
                <EtapaPill etapa={etapa} ativa={ehAtiva} concluida={jaPassou} />
                {i < ETAPAS.length - 1 && (
                  <span
                    className={`mx-1.5 h-px w-4 ${
                      jaPassou ? 'bg-primary/60' : 'bg-hairline'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function EtapaPill({
  etapa,
  ativa,
  concluida,
}: {
  etapa: Etapa;
  ativa: boolean;
  concluida: boolean;
}) {
  const base =
    'flex items-center gap-1.5 rounded-pill px-2.5 py-1 transition';
  const variante = ativa
    ? 'bg-primary/15 ring-1 ring-primary/50 animate-pulse-soft'
    : concluida
      ? 'bg-success/10 ring-1 ring-success/30'
      : 'bg-surface-card ring-1 ring-hairline';

  return (
    <div className={`${base} ${variante}`} title={`${etapa.ordem}. ${etapa.rotulo} — ${etapa.descricao}`}>
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-pill text-[9px] font-semibold ${
          ativa
            ? 'bg-primary text-on-primary'
            : concluida
              ? 'bg-success text-on-primary'
              : 'bg-surface-strong text-muted'
        }`}
      >
        {etapa.ordem}
      </span>
      <span
        className={`text-[11px] font-medium ${
          ativa ? 'text-ink' : concluida ? 'text-body-strong' : 'text-muted'
        }`}
      >
        {etapa.rotulo}
      </span>
    </div>
  );
}
