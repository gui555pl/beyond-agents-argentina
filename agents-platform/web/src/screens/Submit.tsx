/**
 * Submit — tela pública do formulário simplificado.
 *
 * 12 campos visíveis. Por baixo dos panos, o SubmissionExpander do backend
 * mescla com defaults por vertical para gerar a SubmissaoAurora completa.
 *
 * Botões topo: Pré-preencher com Erudio / MedFlow / Limpar.
 * Validação client-side: campos 1-9 obrigatórios.
 * Submit → POST /api/submissions → navigate(/runs/:runId).
 */
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFixture, submitForm } from '../lib/api';
import { useStore } from '../lib/store';
import type { FormSimplificado, FixtureRes, TempoTrabalho, Vertical } from '../lib/tipos';

const VERTICAIS: Array<{ id: Vertical; label: string; cor: string }> = [
  { id: 'edtech', label: 'EdTech', cor: 'bg-vertical-ed/15 ring-vertical-ed/40 text-vertical-ed' },
  { id: 'healthtech', label: 'HealthTech', cor: 'bg-vertical-health/15 ring-vertical-health/40 text-vertical-health' },
  { id: 'legaltech', label: 'LegalTech', cor: 'bg-vertical-legal/15 ring-vertical-legal/40 text-vertical-legal' },
  { id: 'govtech', label: 'GovTech', cor: 'bg-vertical-gov/15 ring-vertical-gov/40 text-vertical-gov' },
  { id: 'outra', label: 'Outra', cor: 'bg-surface-strong ring-hairline-strong text-body-strong' },
];

const TEMPOS: Array<{ id: TempoTrabalho; label: string }> = [
  { id: 'menos-1m', label: 'Menos de 1 mês' },
  { id: '1-3m', label: '1 a 3 meses' },
  { id: '3-6m', label: '3 a 6 meses' },
  { id: '6m-1y', label: '6 meses a 1 ano' },
  { id: 'mais-1y', label: 'Mais de 1 ano' },
];

const FORM_VAZIO: FormSimplificado = {
  nome_solucao: '',
  vertical: 'edtech',
  descricao_curta: '',
  dor_e_evidencia: '',
  publico_alvo: '',
  diferencial_moat: '',
  concorrentes: '',
  tam_aproximado: '',
  barreira_legal_imediata: false,
  barreira_legal_detalhes: '',
  tempo_trabalhando: '6m-1y',
  founder_background: '',
  email: '',
};

function fixtureParaForm(fix: FixtureRes): FormSimplificado {
  const s = fix.submissao_aurora;
  const founder = s.founders[0];
  // Mapeia 'tempo_de_trabalho' textual de volta pra enum de forma tolerante
  const tempoTxt = s.progresso.tempo_de_trabalho.toLowerCase();
  let tempo: TempoTrabalho = '6m-1y';
  if (tempoTxt.includes('menos de 1') || tempoTxt.includes('1 mês')) tempo = 'menos-1m';
  else if (tempoTxt.includes('1 a 3') || tempoTxt.includes('1-3')) tempo = '1-3m';
  else if (tempoTxt.includes('3 a 6') || tempoTxt.includes('3-6')) tempo = '3-6m';
  else if (tempoTxt.includes('11 meses') || tempoTxt.includes('14 meses') || tempoTxt.includes('6 meses') || tempoTxt.includes('6m-1y')) tempo = '6m-1y';
  else if (tempoTxt.includes('mais de 1') || tempoTxt.includes('+1y')) tempo = 'mais-1y';

  return {
    nome_solucao: s.solucao.nome,
    vertical: s.solucao.vertical,
    descricao_curta: s.solucao.descricao_50_chars,
    dor_e_evidencia: s.problema_mercado.dor_latente_e_evidencias,
    publico_alvo: s.problema_mercado.publico_problema_solucao,
    diferencial_moat: s.problema_mercado.diferencial_moat,
    concorrentes: s.problema_mercado.concorrentes_e_lacunas,
    tam_aproximado: s.problema_mercado.tam_sam_som,
    barreira_legal_imediata: s.problema_mercado.barreira_legal_imediata,
    barreira_legal_detalhes: '',
    tempo_trabalhando: tempo,
    founder_background: founder?.historico_trabalho ?? '',
    email: founder?.email ?? '',
  };
}

export function Submit() {
  const navigate = useNavigate();
  const reset = useStore((s) => s.reset);
  const [form, setForm] = useState<FormSimplificado>(FORM_VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [campoComErro, setCampoComErro] = useState<keyof FormSimplificado | null>(null);
  const [carregandoDefaults, setCarregandoDefaults] = useState(true);

  const set = <K extends keyof FormSimplificado>(k: K, v: FormSimplificado[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const prepreencher = async (vertical: 'edtech' | 'healthtech') => {
    setErro(null);
    setCampoComErro(null);
    try {
      const fix = await getFixture(vertical);
      setForm(fixtureParaForm(fix));
    } catch (err) {
      setErro(err instanceof Error ? err.message : String(err));
    }
  };

  // Carrega defaults Erudio automaticamente ao montar — modo apresentação.
  // O usuário pode trocar/limpar a qualquer momento via botões do topo.
  useEffect(() => {
    let cancelado = false;
    setCarregandoDefaults(true);
    getFixture('edtech')
      .then((fix) => {
        if (!cancelado) setForm(fixtureParaForm(fix));
      })
      .catch((err) => {
        if (!cancelado) setErro(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelado) setCarregandoDefaults(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const limpar = () => {
    setForm(FORM_VAZIO);
    setErro(null);
    setCampoComErro(null);
  };

  const validar = (): keyof FormSimplificado | null => {
    if (form.nome_solucao.trim().length < 2) return 'nome_solucao';
    if (form.descricao_curta.trim().length < 10) return 'descricao_curta';
    if (form.dor_e_evidencia.trim().length < 20) return 'dor_e_evidencia';
    if (form.publico_alvo.trim().length < 5) return 'publico_alvo';
    if (form.diferencial_moat.trim().length < 10) return 'diferencial_moat';
    if (form.concorrentes.trim().length < 3) return 'concorrentes';
    if (form.tam_aproximado.trim().length < 1) return 'tam_aproximado';
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    const erroCampo = validar();
    if (erroCampo) {
      setCampoComErro(erroCampo);
      setErro('Confira os campos destacados antes de enviar.');
      return;
    }
    setEnviando(true);
    reset();
    try {
      const payload: FormSimplificado = {
        ...form,
        email: form.email?.trim() || undefined,
        founder_background: form.founder_background?.trim() || undefined,
        barreira_legal_detalhes: form.barreira_legal_detalhes?.trim() || undefined,
      };
      const resp = await submitForm(payload);
      navigate(`/runs/${resp.runId}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : String(err));
    } finally {
      setEnviando(false);
    }
  };

  const inputBase =
    'w-full rounded-md border border-hairline bg-canvas-soft px-4 py-3 text-body-md text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
  const labelBase = 'block text-caption-uppercase text-muted mb-2';
  const errClass = 'border-danger ring-1 ring-danger';

  return (
    <div className="relative h-full overflow-y-auto bg-canvas">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-aurora-radial" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-8 pb-20 pt-14">
        <header className="max-w-3xl">
          <p className="text-caption-uppercase text-primary-light">Beyond Agents · Aurora</p>
          <h1 className="mt-3 text-display-lg text-ink">Submeta sua ideia</h1>
          <p className="mt-3 text-body-md text-body">
            Preencha o formulário abaixo. Em minutos o autovalidador gera LPs, anúncios, submete a
            um swarm de personas sintéticas e devolve um score multivariável.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-hairline bg-surface-card p-4">
          <div className="flex flex-col">
            <span className="text-caption-uppercase text-muted">Exemplo pré-carregado</span>
            <span className="text-caption text-muted-soft">
              {carregandoDefaults ? 'Carregando defaults…' : 'Pode editar livremente antes de submeter'}
            </span>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => prepreencher('edtech')}
              className="rounded-md bg-surface-strong px-3 py-1.5 text-caption-uppercase text-ink ring-1 ring-hairline-strong hover:bg-primary hover:text-on-primary"
            >
              Erudio · EdTech
            </button>
            <button
              type="button"
              onClick={() => prepreencher('healthtech')}
              className="rounded-md bg-surface-strong px-3 py-1.5 text-caption-uppercase text-ink ring-1 ring-hairline-strong hover:bg-primary hover:text-on-primary"
            >
              MedFlow · HealthTech
            </button>
            <button
              type="button"
              onClick={limpar}
              className="rounded-md px-3 py-1.5 text-caption-uppercase text-muted hover:text-ink"
            >
              Limpar
            </button>
          </div>
        </div>

        {erro && (
          <div className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-body-sm text-ink">
            {erro}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-8">
          <Bloco numero="01" titulo="Solução">
            <Campo label="Nome da solução" obrigatorio>
              <input
                type="text"
                value={form.nome_solucao}
                onChange={(e) => set('nome_solucao', e.target.value)}
                placeholder="Ex: Erudio"
                className={`${inputBase} ${campoComErro === 'nome_solucao' ? errClass : ''}`}
                maxLength={80}
              />
            </Campo>

            <Campo label="Vertical" obrigatorio>
              <div className="flex flex-wrap gap-2">
                {VERTICAIS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => set('vertical', v.id)}
                    className={`rounded-pill px-4 py-1.5 text-caption-uppercase ring-1 transition ${
                      form.vertical === v.id ? v.cor : 'bg-canvas-soft text-muted ring-hairline'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </Campo>

            <Campo label="Em 1 frase, o que faz" obrigatorio dica="Até 180 caracteres">
              <textarea
                value={form.descricao_curta}
                onChange={(e) => set('descricao_curta', e.target.value)}
                placeholder="Ex: Plataforma de gestão educacional com IA para hospitais-escola e universidades médias"
                rows={2}
                maxLength={180}
                className={`${inputBase} resize-none ${campoComErro === 'descricao_curta' ? errClass : ''}`}
              />
            </Campo>
          </Bloco>

          <Bloco numero="02" titulo="Problema & Mercado">
            <Campo label="Dor que resolve + evidências" obrigatorio>
              <textarea
                value={form.dor_e_evidencia}
                onChange={(e) => set('dor_e_evidencia', e.target.value)}
                placeholder="Qual dor você resolve e o que comprova que ela existe? (entrevistas, dados, estudos)"
                rows={4}
                className={`${inputBase} resize-none ${campoComErro === 'dor_e_evidencia' ? errClass : ''}`}
              />
            </Campo>

            <Campo label="Pra quem é (público-alvo)" obrigatorio>
              <input
                type="text"
                value={form.publico_alvo}
                onChange={(e) => set('publico_alvo', e.target.value)}
                placeholder="Ex: Coordenadores de residência médica em hospitais-escola com 100+ residentes"
                className={`${inputBase} ${campoComErro === 'publico_alvo' ? errClass : ''}`}
              />
            </Campo>

            <Campo label="Diferencial / moat" obrigatorio>
              <textarea
                value={form.diferencial_moat}
                onChange={(e) => set('diferencial_moat', e.target.value)}
                placeholder="Por que vocês? Tecnologia própria, dados exclusivos, posição única."
                rows={3}
                className={`${inputBase} resize-none ${campoComErro === 'diferencial_moat' ? errClass : ''}`}
              />
            </Campo>

            <Campo label="Concorrentes principais" obrigatorio>
              <input
                type="text"
                value={form.concorrentes}
                onChange={(e) => set('concorrentes', e.target.value)}
                placeholder="Ex: TOTVS, Sponte, Moodle — nenhum cobre rodízio + auditoria juntos"
                className={`${inputBase} ${campoComErro === 'concorrentes' ? errClass : ''}`}
              />
            </Campo>

            <Campo label="TAM aproximado" obrigatorio>
              <input
                type="text"
                value={form.tam_aproximado}
                onChange={(e) => set('tam_aproximado', e.target.value)}
                placeholder="Ex: R$ 8-12 Bi (EdTech B2B Brasil)"
                className={`${inputBase} ${campoComErro === 'tam_aproximado' ? errClass : ''}`}
              />
            </Campo>

            <Campo label="Existe barreira legal imediata?" obrigatorio>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => set('barreira_legal_imediata', false)}
                  className={`rounded-md px-4 py-2 text-button ring-1 transition ${
                    !form.barreira_legal_imediata
                      ? 'bg-primary text-on-primary ring-primary'
                      : 'bg-canvas-soft text-body ring-hairline'
                  }`}
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={() => set('barreira_legal_imediata', true)}
                  className={`rounded-md px-4 py-2 text-button ring-1 transition ${
                    form.barreira_legal_imediata
                      ? 'bg-danger text-on-primary ring-danger'
                      : 'bg-canvas-soft text-body ring-hairline'
                  }`}
                >
                  Sim
                </button>
              </div>
              {form.barreira_legal_imediata && (
                <textarea
                  value={form.barreira_legal_detalhes}
                  onChange={(e) => set('barreira_legal_detalhes', e.target.value)}
                  placeholder="Qual barreira? Lei, regulamento, órgão regulador."
                  rows={2}
                  className={`${inputBase} mt-3 resize-none`}
                />
              )}
            </Campo>
          </Bloco>

          <Bloco numero="03" titulo="Sobre vocês">
            <Campo label="Tempo trabalhando nisso">
              <div className="flex flex-wrap gap-2">
                {TEMPOS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set('tempo_trabalhando', t.id)}
                    className={`rounded-pill px-4 py-1.5 text-caption-uppercase ring-1 transition ${
                      form.tempo_trabalhando === t.id
                        ? 'bg-primary/20 text-primary-light ring-primary/40'
                        : 'bg-canvas-soft text-muted ring-hairline'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Campo>

            <Campo label="Background do founder principal" dica="LinkedIn, experiência relevante, exits anteriores">
              <textarea
                value={form.founder_background}
                onChange={(e) => set('founder_background', e.target.value)}
                placeholder="Ex: 9 anos liderando produto em EdTechs B2B, exit em 2022, MBA em Education Tech."
                rows={3}
                className={`${inputBase} resize-none`}
              />
            </Campo>

            <Campo label="Email (opcional)" dica="Para recuperar o link da sua validação depois">
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="seu@email.com"
                className={inputBase}
              />
            </Campo>
          </Bloco>

          <div className="flex flex-col items-stretch gap-3 pt-2">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-md bg-primary px-8 py-4 text-button text-on-primary transition hover:bg-primary-active disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? 'Enviando…' : 'Validar minha ideia'}
            </button>
            <p className="text-center text-caption text-muted">
              Roda ao vivo · tempo estimado 1–3 minutos · você recebe um link único para revisitar o resultado.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function Bloco({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-hairline bg-surface-card p-6">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="text-caption-uppercase text-primary-light">{numero}</span>
        <h2 className="text-display-sm text-ink">{titulo}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Campo({
  label,
  obrigatorio,
  dica,
  children,
}: {
  label: string;
  obrigatorio?: boolean;
  dica?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-caption-uppercase text-muted mb-2">
        {label}
        {obrigatorio && <span className="ml-1 text-primary-light">*</span>}
        {dica && <span className="ml-2 normal-case tracking-normal text-caption text-muted-soft">{dica}</span>}
      </label>
      {children}
    </div>
  );
}
