/**
 * Badge discreto no canto inferior direito que indica o estado da conexão SSE.
 *
 * 'live'         → bolinha verde + texto "ao vivo"
 * 'connecting'   → âmbar pulsando + "conectando…"
 * 'reconnecting' → âmbar pulsando + "reconectando…"
 * 'lost'         → vermelho + botão para recarregar
 * 'closed' / 'idle' → não renderiza
 */
import { useStore } from '../lib/store';

export function ConnectionBadge() {
  const status = useStore((s) => s.connectionStatus);

  if (status === 'idle' || status === 'closed') return null;

  const config: Record<'live' | 'connecting' | 'reconnecting' | 'lost', { cor: string; texto: string; pulse: boolean }> = {
    live: { cor: 'bg-semantic-success', texto: 'ao vivo', pulse: false },
    connecting: { cor: 'bg-semantic-warning', texto: 'conectando…', pulse: true },
    reconnecting: { cor: 'bg-semantic-warning', texto: 'reconectando…', pulse: true },
    lost: { cor: 'bg-semantic-error', texto: 'conexão perdida', pulse: false },
  };
  const c = config[status];
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-pill border border-hairline bg-canvas-soft/90 px-3 py-1.5 text-caption text-ink backdrop-blur-sm">
      <span className={`h-2 w-2 rounded-full ${c.cor} ${c.pulse ? 'animate-pulse' : ''}`} />
      <span className="text-caption text-body-strong">{c.texto}</span>
      {status === 'lost' && (
        <button
          onClick={() => window.location.reload()}
          className="pointer-events-auto ml-1 rounded-sm bg-primary/20 px-2 py-0.5 text-caption text-primary-light hover:bg-primary/30"
        >
          recarregar
        </button>
      )}
    </div>
  );
}
