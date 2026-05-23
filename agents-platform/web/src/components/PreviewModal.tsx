/**
 * Modal de preview em tela cheia.
 *
 * Usado para abrir LP e Ads em tamanho confortável, fora do painel lateral
 * estreito (440px). Aplica linguagem Aurora: canvas escuro, hairline, sem
 * drop shadows pesadas, fechamento por ESC ou clique fora.
 */
import { useEffect } from 'react';

export interface PreviewModalProps {
  aberto: boolean;
  onClose: () => void;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}

export function PreviewModal({ aberto, onClose, titulo, subtitulo, children }: PreviewModalProps) {
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aberto, onClose]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-canvas/90 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-hairline bg-canvas-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-hairline bg-canvas-soft px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-title-md text-ink">{titulo}</h2>
            {subtitulo && <p className="mt-0.5 truncate text-caption text-body">{subtitulo}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-md border border-hairline-strong px-3 py-1.5 text-caption text-body-strong transition hover:border-primary hover:text-ink"
          >
            Fechar (esc)
          </button>
        </header>
        <div className="flex-1 overflow-auto bg-canvas">{children}</div>
      </div>
    </div>
  );
}
