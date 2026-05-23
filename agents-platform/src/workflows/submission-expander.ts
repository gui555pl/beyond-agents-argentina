/**
 * Submission Expander — função pura.
 *
 * O usuário preenche um formulário simplificado de 12 campos (tela /submit).
 * O pipeline interno consome a `SubmissaoAurora` completa com 5 blocos. Este
 * expander mescla os campos do form sobre defaults por vertical para gerar
 * a submissão completa.
 *
 * Defaults disponíveis: Erudio (edtech), MedFlow (healthtech) e um genérico
 * para verticais sem default calibrado. O form sempre **sobrescreve** os
 * defaults nos campos que ele cobre.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FormSimplificado, TempoTrabalho, Vertical } from '../lib/schemas.js';
import type { SubmissaoAurora } from '../lib/tipos.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(HERE, '..', 'fixtures');

interface DefaultsFile {
  submissao_aurora: SubmissaoAurora;
  hipotese_raiz: string;
}

function loadDefaults(arquivo: string): DefaultsFile {
  const path = resolve(FIXTURES_DIR, arquivo);
  if (!existsSync(path)) throw new Error(`Defaults não encontrado: ${path}`);
  return JSON.parse(readFileSync(path, 'utf-8')) as DefaultsFile;
}

function pickDefaultsParaVertical(vertical: Vertical): DefaultsFile {
  switch (vertical) {
    case 'edtech':
      return loadDefaults('defaults-erudio.json');
    case 'healthtech':
      return loadDefaults('defaults-medflow.json');
    default:
      // LegalTech / GovTech / Outra usam o defaults Erudio como base
      // estrutural (founders + finanças) mas todos os campos visíveis
      // virão do form do usuário. A vertical entra como `solucao.vertical`.
      return loadDefaults('defaults-erudio.json');
  }
}

const TEMPO_LEGIVEL: Record<TempoTrabalho, string> = {
  'menos-1m': 'Menos de 1 mês',
  '1-3m': '1 a 3 meses',
  '3-6m': '3 a 6 meses',
  '6m-1y': '6 meses a 1 ano',
  'mais-1y': 'Mais de 1 ano',
};

export interface ExpandirResultado {
  submissao: SubmissaoAurora;
  hipotese_raiz: string;
}

export function expandirSubmissao(form: FormSimplificado): ExpandirResultado {
  const base = pickDefaultsParaVertical(form.vertical);
  const tempoLegivel = TEMPO_LEGIVEL[form.tempo_trabalhando];

  // Founder background: se o usuário forneceu, sobrescreve o histórico_trabalho
  // do primeiro founder dos defaults. Senão, preserva o default.
  const founderBackgroundUsuario = form.founder_background?.trim();
  const foundersAjustados = base.submissao_aurora.founders.map((f, idx) => {
    if (idx === 0 && founderBackgroundUsuario) {
      return {
        ...f,
        historico_trabalho: founderBackgroundUsuario,
      };
    }
    return f;
  });

  const submissao: SubmissaoAurora = {
    founders: foundersAjustados,
    solucao: {
      ...base.submissao_aurora.solucao,
      nome: form.nome_solucao,
      descricao_50_chars: form.descricao_curta,
      vertical: form.vertical,
    },
    progresso: {
      ...base.submissao_aurora.progresso,
      tempo_de_trabalho: tempoLegivel,
    },
    problema_mercado: {
      ...base.submissao_aurora.problema_mercado,
      dor_latente_e_evidencias: form.dor_e_evidencia,
      publico_problema_solucao: form.publico_alvo,
      diferencial_moat: form.diferencial_moat,
      concorrentes_e_lacunas: form.concorrentes,
      tam_sam_som: form.tam_aproximado,
      barreira_legal_imediata: form.barreira_legal_imediata,
    },
    expectativas: base.submissao_aurora.expectativas,
  };

  // Hipótese raiz: 1 linha contextual a partir do nome + dor + público.
  const hipotese_raiz = `${form.nome_solucao}: ${form.descricao_curta}. ${form.publico_alvo}.`;

  return { submissao, hipotese_raiz };
}
