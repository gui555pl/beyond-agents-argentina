/**
 * Log fino dos últimos eventos do pipeline — barra inferior decorativa.
 *
 * Mantém apenas tipografia de caption e cores discretas (body / primary
 * / semantic). Nada de palette colorida fora do design Aurora.
 */
import { useStore } from '../lib/store';

const EVENT_LABEL: Record<string, { texto: string; cor: string }> = {
  no_criado: { texto: 'Nó criado', cor: 'text-primary-light' },
  estado_mudou: { texto: 'Estado', cor: 'text-body-strong' },
  validador_pronto: { texto: 'Validador', cor: 'text-primary-light' },
  buscador_pronto: { texto: 'Buscador', cor: 'text-primary-light' },
  lp_pronta: { texto: 'LP', cor: 'text-body-strong' },
  ads_prontos: { texto: 'Ads', cor: 'text-body-strong' },
  trafego_disparado: { texto: 'Gestor de Tráfego', cor: 'text-journey-build' },
  persona_respondeu: { texto: 'Swarm', cor: 'text-journey-scale' },
  performance_pronta: { texto: 'Performance', cor: 'text-success' },
  orquestrador_decidiu: { texto: 'Orquestrador', cor: 'text-journey-done' },
  no_finalizado: { texto: 'Nó completo', cor: 'text-body' },
  cap_atingido: { texto: 'Cap atingido', cor: 'text-danger' },
  pipeline_finalizado: { texto: 'Pipeline pronto', cor: 'text-success' },
};

function resumir(evento: ReturnType<typeof useStore.getState>['eventos'][number]): string {
  switch (evento.tipo) {
    case 'no_criado':
      return `${evento.no.id} — ${evento.no.hipotese.titulo}`;
    case 'estado_mudou':
      return `${evento.no_id} → ${evento.estado}`;
    case 'validador_pronto':
      return `${evento.no_id} score ${evento.score.toFixed(1)} (${evento.recomendacao})${evento.veto ? ' VETO' : ''}`;
    case 'buscador_pronto':
      return `${evento.no_id} dossiê pronto`;
    case 'lp_pronta':
      return `${evento.no_id} → ${evento.lp_id} (${evento.angulo})`;
    case 'ads_prontos':
      return `${evento.no_id} ${evento.qtd} ads`;
    case 'trafego_disparado':
      return `${evento.no_id} → ${evento.campanha_id} (${evento.qtd_personas_target} personas)`;
    case 'persona_respondeu':
      return `${evento.persona_nome} (${evento.done}/${evento.total}) int.${evento.intencao}`;
    case 'performance_pronta':
      return `${evento.no_id} → ${evento.metricas.veredito}`;
    case 'orquestrador_decidiu':
      return `${evento.no_id} → ${evento.decisao.acao}`;
    case 'no_finalizado':
      return `${evento.no.id} finalizado (${evento.no.estado})`;
    case 'cap_atingido':
      return `${evento.cap} = ${evento.valor}`;
    case 'pipeline_finalizado':
      return `${evento.ranking.length} no ranking • US$ ${evento.custo_total.cost_usd.toFixed(4)}`;
  }
}

export function EventLog() {
  const eventos = useStore((s) => s.eventos.slice(-8).reverse());
  return (
    <div className="border-t border-hairline bg-canvas-soft px-6 py-2.5">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="shrink-0 text-caption-uppercase text-muted">Eventos</span>
        <div className="flex flex-1 gap-4 overflow-hidden">
          {eventos.length === 0 ? (
            <span className="text-caption text-muted-soft">Aguardando…</span>
          ) : (
            eventos.map((e, i) => {
              const meta = EVENT_LABEL[e.tipo] ?? { texto: e.tipo, cor: 'text-body' };
              return (
                <span
                  key={`${e.tipo}-${i}`}
                  className="animate-slide-in flex shrink-0 items-center gap-1.5 text-caption"
                >
                  <span className={`font-semibold ${meta.cor}`}>{meta.texto}</span>
                  <span className="text-body">{resumir(e)}</span>
                </span>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
