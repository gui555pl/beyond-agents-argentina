/**
 * Hook useSSE — abre EventSource para uma run específica e empurra cada
 * evento na store. Reporta o estado da conexão via `setConnection`.
 *
 * Fecha automaticamente em `pipeline_finalizado` ou quando o componente
 * desmonta. Reconexão é nativa do browser; só logamos e atualizamos o
 * estado visual.
 */
import { useEffect } from 'react';
import { API_BASE } from './api';
import { useStore } from './store';
import type { EventoPipeline } from './tipos';

export function useSSE(runId: string | null): void {
  const aplicarEvento = useStore((s) => s.aplicarEvento);
  const setErro = useStore((s) => s.setErro);
  const setConnection = useStore((s) => s.setConnection);

  useEffect(() => {
    if (!runId) {
      setConnection('idle');
      return;
    }
    setConnection('connecting');
    const es = new EventSource(`${API_BASE}/api/runs/${runId}/events`);

    es.onopen = () => setConnection('live');

    es.onmessage = (msg) => {
      try {
        const evento = JSON.parse(msg.data) as EventoPipeline;
        aplicarEvento(evento);
        if (evento.tipo === 'pipeline_finalizado') {
          setConnection('closed');
          es.close();
        }
      } catch (err) {
        console.error('Erro ao parsear evento SSE:', err, msg.data);
      }
    };

    es.onerror = () => {
      if (es.readyState === EventSource.CONNECTING) {
        setConnection('reconnecting');
      } else if (es.readyState === EventSource.CLOSED) {
        setConnection('lost');
        setErro('Conexão com servidor perdida.');
      }
    };

    return () => {
      es.close();
      setConnection('closed');
    };
  }, [runId, aplicarEvento, setErro, setConnection]);
}
