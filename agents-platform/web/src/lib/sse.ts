/**
 * Hook useSSE — abre EventSource e empurra cada evento na store.
 *
 * Fecha automaticamente em `pipeline_finalizado` ou quando o componente
 * desmonta. Erros viram setErro na store.
 */
import { useEffect } from 'react';
import { useStore } from './store';
import type { EventoPipeline } from './tipos';

export function useSSE(runId: string | null): void {
  const aplicarEvento = useStore((s) => s.aplicarEvento);
  const setErro = useStore((s) => s.setErro);

  useEffect(() => {
    if (!runId) return;
    const es = new EventSource(`/api/runs/${runId}/events`);

    es.onmessage = (msg) => {
      try {
        const evento = JSON.parse(msg.data) as EventoPipeline;
        aplicarEvento(evento);
        if (evento.tipo === 'pipeline_finalizado') {
          es.close();
        }
      } catch (err) {
        console.error('Erro ao parsear evento SSE:', err, msg.data);
      }
    };

    es.onerror = () => {
      // EventSource reconecta automaticamente; só logamos
      console.warn('SSE onerror — readyState', es.readyState);
      if (es.readyState === EventSource.CLOSED) {
        setErro('Conexão com servidor perdida.');
      }
    };

    return () => es.close();
  }, [runId, aplicarEvento, setErro]);
}
