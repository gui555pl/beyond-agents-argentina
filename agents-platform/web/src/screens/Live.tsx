/**
 * Live — tela de execução de UMA run específica.
 *
 * Recebe `runId` via `useParams`. Hidrata a store ao montar:
 * 1. Busca `/api/submissions/:runId` pra puxar status + submissão completa
 * 2. Configura a store com `hidratarRun`
 * 3. `useSSE(runId)` abre o stream
 *
 * Suporta estado `queued` (mostra spinner + posição na fila).
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { useSSE } from '../lib/sse';
import { cancelarRun, getSubmissionInfo } from '../lib/api';
import { Tree } from '../components/Tree';
import { SidePanel } from '../components/SidePanel';
import { EventLog } from '../components/EventLog';
import { PipelineStepper } from '../components/PipelineStepper';
import { ConnectionBadge } from '../components/ConnectionBadge';
import type { SubmissaoAurora } from '../lib/tipos';

const VERTICAL_BADGE: Record<string, { bg: string; text: string }> = {
  healthtech: { bg: 'bg-vertical-health/15', text: 'text-vertical-health' },
  govtech: { bg: 'bg-vertical-gov/15', text: 'text-vertical-gov' },
  legaltech: { bg: 'bg-vertical-legal/15', text: 'text-vertical-legal' },
  edtech: { bg: 'bg-vertical-ed/15', text: 'text-vertical-ed' },
  outra: { bg: 'bg-surface-strong', text: 'text-body-strong' },
};

export function Live() {
  const { runId: runIdParam } = useParams<{ runId: string }>();
  const navigate = useNavigate();

  const nos = useStore((s) => Object.values(s.nos));
  const runIdStore = useStore((s) => s.runId);
  const fase = useStore((s) => s.fase);
  const status = useStore((s) => s.status);
  const queuePosition = useStore((s) => s.queuePosition);
  const submissao = useStore((s) => s.submissao);
  const nomeSolucao = useStore((s) => s.nomeSolucao);
  const hidratar = useStore((s) => s.hidratarRun);

  const selecionadoId = useStore((s) => s.selecionadoId);

  const [hidratando, setHidratando] = useState(false);
  const [erroHidratacao, setErroHidratacao] = useState<string | null>(null);
  const [painelMobileAberto, setPainelMobileAberto] = useState(false);

  // Abre o painel automaticamente quando o usuário seleciona um nó no mobile.
  useEffect(() => {
    if (!selecionadoId) return;
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setPainelMobileAberto(true);
    }
  }, [selecionadoId]);

  // Hidratação inicial (quando o usuário chega via URL direta ou recarrega a página)
  useEffect(() => {
    if (!runIdParam) return;
    if (runIdStore === runIdParam && submissao) return; // já hidratado
    setHidratando(true);
    setErroHidratacao(null);
    getSubmissionInfo(runIdParam)
      .then((info) => {
        hidratar({
          runId: info.runId,
          submissionId: info.submissionId,
          nomeSolucao: info.nomeSolucao,
          status: info.status,
          queuePosition: info.queuePosition,
          submissao: ((info.formSimplificado as Record<string, unknown>).submissao_completa as SubmissaoAurora) ??
            ({
              founders: [],
              solucao: { nome: info.nomeSolucao ?? '—', descricao_50_chars: '', por_que_escolheu: '', vertical: (info.vertical ?? 'outra') as SubmissaoAurora['solucao']['vertical'] },
              progresso: { tempo_de_trabalho: '', cash_balance_e_burn_rate: '', projecao_faturamento: '', stack_tecnologico: '', reduz_custos_com_infra_beyond: true, mvp_em_4_semanas: '' },
              problema_mercado: { por_que_essa_ideia: '', dor_latente_e_evidencias: '', publico_problema_solucao: '', diferencial_moat: '', concorrentes_e_lacunas: '', tam_sam_som: '', escalabilidade_sem_custo_proporcional: '', canais_de_venda: '', barreira_legal_imediata: false },
              expectativas: { convencimento: '', areas_de_ajuda: '' },
            } satisfies SubmissaoAurora),
          hipoteseRaiz: info.hipoteseRaiz,
        });
      })
      .catch((err: Error) => setErroHidratacao(err.message))
      .finally(() => setHidratando(false));
  }, [runIdParam, runIdStore, submissao, hidratar]);

  // Conecta o SSE
  useSSE(runIdParam ?? null);

  const personasTotal = nos.reduce((acc, n) => acc + (n.swarm?.respostas.length ?? 0), 0);
  const vertical = submissao?.solucao.vertical ?? 'outra';
  const corVertical = VERTICAL_BADGE[vertical] ?? VERTICAL_BADGE.outra;
  const tituloFase = fase === 'fim' ? 'execução concluída' : status === 'queued' ? 'aguardando na fila' : 'execução ao vivo';

  const onCancelar = async () => {
    if (runIdParam) await cancelarRun(runIdParam);
    navigate('/submit');
  };

  const onNovaSubmissao = () => navigate('/submit');

  if (erroHidratacao) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas px-6">
        <div className="max-w-xl rounded-lg border border-danger/40 bg-danger/10 p-6 text-ink">
          <h2 className="text-title-md">Run não encontrada</h2>
          <p className="mt-2 text-body-sm text-body-strong">{erroHidratacao}</p>
          <button
            onClick={onNovaSubmissao}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-button text-on-primary hover:bg-primary-active"
          >
            Submeter nova ideia
          </button>
        </div>
      </div>
    );
  }

  if (hidratando || !submissao) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas text-body">
        Carregando run…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex flex-col gap-3 border-b border-hairline px-4 py-3 md:flex-row md:items-center md:justify-between md:px-8 md:py-4">
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <p className="text-caption-uppercase text-primary-light">Beyond Agents · {tituloFase}</p>
            <h1 className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-title-md text-ink">
              <span className="truncate">{nomeSolucao ?? submissao.solucao.nome ?? '—'}</span>
              <span
                className={`rounded-pill px-2.5 py-0.5 text-caption-uppercase ${corVertical.bg} ${corVertical.text}`}
              >
                {vertical}
              </span>
              {runIdParam && (
                <span className="font-mono text-caption text-muted">#{runIdParam.slice(0, 8)}</span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto md:gap-6">
          <Indicador rotulo="nós" valor={nos.length.toString()} />
          <Indicador rotulo="LPs" valor={nos.filter((n) => n.lp).length.toString()} />
          <Indicador rotulo="personas" valor={personasTotal.toString()} />
          <Indicador
            rotulo="podadas"
            valor={nos.filter((n) => n.estado === 'podada' || n.estado === 'timeout').length.toString()}
            className="hidden sm:flex"
          />
          <Indicador
            rotulo="promovidas"
            valor={nos.filter((n) => n.estado === 'promovida').length.toString()}
            className="hidden sm:flex"
          />
          {fase === 'live' && status !== 'queued' && (
            <button
              onClick={onCancelar}
              className="shrink-0 rounded-md border border-hairline-strong bg-surface-card px-2 py-1 text-caption-uppercase text-body-strong transition hover:border-danger/60 hover:text-ink md:px-3 md:py-1.5 md:text-button"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={onNovaSubmissao}
            className="shrink-0 rounded-md border border-hairline-strong bg-surface-card px-2 py-1 text-caption-uppercase text-body-strong transition hover:border-primary/60 hover:text-ink md:px-3 md:py-1.5 md:text-button"
          >
            Nova validação
          </button>
        </div>
      </header>

      {status === 'queued' && nos.length === 0 ? (
        <div className="flex flex-1 items-center justify-center bg-canvas">
          <div className="max-w-md rounded-lg border border-hairline bg-surface-card p-8 text-center">
            <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-primary/30" />
            <h2 className="mt-5 text-display-sm text-ink">Sua run está na fila</h2>
            <p className="mt-2 text-body-sm text-body">
              {queuePosition === 1
                ? 'Você é a próxima a entrar — começa em segundos.'
                : `${queuePosition - 1} ${queuePosition - 1 === 1 ? 'submissão' : 'submissões'} à sua frente.`}
            </p>
            <p className="mt-3 text-caption text-muted">A página atualiza sozinha quando começar.</p>
          </div>
        </div>
      ) : (
        <>
          <PipelineStepper />
          <div className="flex flex-1 overflow-hidden">
            <main className="relative flex flex-1 flex-col bg-canvas">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-0 bg-aurora-radial-soft" />
                <div className="relative h-full">
                  <Tree />
                </div>
              </div>
              <EventLog />
              {selecionadoId && (
                <button
                  type="button"
                  onClick={() => setPainelMobileAberto(true)}
                  className="absolute bottom-16 right-4 z-30 rounded-pill bg-primary px-4 py-2.5 text-button text-on-primary shadow-lg transition hover:bg-primary-active md:hidden"
                >
                  Ver detalhes
                </button>
              )}
            </main>
            <aside className="hidden w-[440px] flex-col border-l border-hairline bg-canvas-soft md:flex">
              <SidePanel />
            </aside>
          </div>
          {painelMobileAberto && (
            <div className="fixed inset-0 z-40 flex flex-col bg-canvas-soft md:hidden">
              <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                <span className="text-caption-uppercase text-muted">Detalhes do nó</span>
                <button
                  type="button"
                  onClick={() => setPainelMobileAberto(false)}
                  className="rounded-md border border-hairline-strong bg-surface-card px-3 py-1 text-caption-uppercase text-body-strong hover:text-ink"
                >
                  Fechar ✕
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SidePanel />
              </div>
            </div>
          )}
        </>
      )}

      <ConnectionBadge />
    </div>
  );
}

function Indicador({ rotulo, valor, className }: { rotulo: string; valor: string; className?: string }) {
  return (
    <div className={`flex shrink-0 flex-col items-end leading-tight ${className ?? ''}`}>
      <span className="text-caption-uppercase text-muted">{rotulo}</span>
      <span className="font-mono text-title-md text-ink">{valor}</span>
    </div>
  );
}
