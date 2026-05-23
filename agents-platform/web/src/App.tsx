import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Submit } from './screens/Submit';
import { Presenter } from './screens/Presenter';
import { Live } from './screens/Live';
import { Scoreboard } from './screens/Scoreboard';
import { useStore } from './lib/store';

/**
 * Roteamento:
 * - `/`            → redireciona para `/submit`
 * - `/submit`      → formulário simplificado (público)
 * - `/runs/:runId` → tela Live de uma run específica
 * - `/presenter`   → modo apresentador (carrega fixture pré-preenchida)
 */
export function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen flex-col bg-canvas text-ink">
        <Routes>
          <Route path="/" element={<Navigate to="/submit" replace />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/presenter" element={<Presenter />} />
          <Route path="/runs/:runId" element={<LiveRoute />} />
          <Route path="*" element={<Navigate to="/submit" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function LiveRoute() {
  const fase = useStore((s) => s.fase);
  return (
    <>
      <Live />
      {fase === 'fim' && <Scoreboard />}
    </>
  );
}
