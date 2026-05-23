import { useStore } from './lib/store';
import { useSSE } from './lib/sse';
import { Home } from './screens/Home';
import { Live } from './screens/Live';
import { Scoreboard } from './screens/Scoreboard';

export function App() {
  const fase = useStore((s) => s.fase);
  const runId = useStore((s) => s.runId);
  // Hook SSE só faz alguma coisa quando runId existe
  useSSE(runId);

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      {fase === 'home' && <Home />}
      {(fase === 'live' || fase === 'fim') && <Live />}
      {fase === 'fim' && <Scoreboard />}
    </div>
  );
}
