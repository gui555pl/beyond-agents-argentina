#!/usr/bin/env node
/**
 * CLI runner do pipeline Beyond Agents.
 *
 * Uso:  npm run pipeline
 *
 * Lê o formulário de fixtures/submissao-healthtech.json, roda toda a árvore,
 * imprime eventos coloridos no terminal em tempo real, gera relatório JSON +
 * Markdown em out/, e mostra custo total em USD.
 */
import 'dotenv/config';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { explorarArvore } from '../src/workflows/explorar-arvore.js';
import { costTracker } from '../src/lib/cost-tracker.js';
import type { EventoPipeline, No, SubmissaoAurora } from '../src/lib/tipos.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const FIXTURE_PATH = resolve(ROOT, 'src/fixtures/submissao-healthtech.json');
const OUT_DIR = resolve(ROOT, 'out');

// ─── ANSI helpers (sem dependência externa) ─────────────────────────────────

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function paint(color: keyof typeof c, s: string): string {
  return `${c[color]}${s}${c.reset}`;
}

function ts(): string {
  return paint('gray', new Date().toLocaleTimeString('pt-BR'));
}

function badge(text: string, color: keyof typeof c): string {
  return `${c[color]}${c.bold}[${text}]${c.reset}`;
}

// ─── Listener de eventos ────────────────────────────────────────────────────

function makeListener(): (e: EventoPipeline) => void {
  return (e) => {
    switch (e.tipo) {
      case 'no_criado':
        console.log(
          `${ts()} ${badge('NÓ', 'cyan')} ${paint('bold', e.no.id)} criado ${paint('dim', `(prof ${e.no.profundidade}, parent ${e.no.parent_id ?? 'raiz'})`)}\n  ${paint('cyan', '→')} ${e.no.hipotese.titulo}`,
        );
        break;
      case 'estado_mudou': {
        const cor: keyof typeof c =
          e.estado === 'aprovada' || e.estado === 'promovida'
            ? 'green'
            : e.estado === 'podada' || e.estado === 'timeout'
              ? 'red'
              : e.estado === 'refinando'
                ? 'yellow'
                : 'blue';
        console.log(`${ts()} ${badge('ESTADO', cor)} ${e.no_id} → ${paint(cor, e.estado)}`);
        break;
      }
      case 'buscador_pronto':
        console.log(`${ts()} ${badge('BUSCADOR', 'magenta')} dossiê pronto (compartilhado pela árvore)`);
        break;
      case 'validador_pronto': {
        const cor = e.veto ? 'red' : e.score >= 80 ? 'green' : e.score >= 60 ? 'yellow' : 'red';
        console.log(
          `${ts()} ${badge('VALIDADOR', 'magenta')} ${e.no_id} → score ${paint(cor, e.score.toFixed(1))} • ${e.recomendacao}${e.veto ? paint('red', ' • VETO') : ''}`,
        );
        break;
      }
      case 'lp_pronta':
        console.log(
          `${ts()} ${badge('LP', 'blue')} ${e.no_id} → ${e.lp_id} ${paint('dim', `(${e.angulo})`)}`,
        );
        break;
      case 'ads_prontos':
        console.log(`${ts()} ${badge('ADS', 'blue')} ${e.no_id} → ${e.qtd} ads gerados`);
        break;
      case 'persona_respondeu': {
        const tag = e.pagaria ? paint('green', '✓ pagaria') : paint('gray', '✗ não pagaria');
        console.log(
          `${ts()} ${badge('SWARM', 'magenta')} [${e.done}/${e.total}] ${paint('bold', e.persona_nome)} (int ${e.intencao}/10) ${tag}\n  ${paint('dim', '"' + e.feedback.slice(0, 140) + '"')}`,
        );
        break;
      }
      case 'performance_pronta': {
        const cor: keyof typeof c =
          e.metricas.veredito === 'aprovada'
            ? 'green'
            : e.metricas.veredito === 'refinar'
              ? 'yellow'
              : 'red';
        console.log(
          `${ts()} ${badge('PERFORMANCE', cor)} ${e.no_id} → ${paint(cor, e.metricas.veredito.toUpperCase())}\n  pagariam: ${(e.metricas.taxa_pagaria * 100).toFixed(0)}% • int.média: ${e.metricas.intencao_media.toFixed(1)}/10 • Sean-Ellis: ${(e.metricas.sean_ellis_proxy * 100).toFixed(0)}%\n  ${paint('dim', e.metricas.motivo_veredito)}`,
        );
        break;
      }
      case 'orquestrador_decidiu': {
        const cor: keyof typeof c =
          e.decisao.acao === 'promover'
            ? 'green'
            : e.decisao.acao === 'expandir'
              ? 'cyan'
              : e.decisao.acao === 'refinar'
                ? 'yellow'
                : 'red';
        console.log(
          `${ts()} ${badge('ORQUESTRADOR', cor)} ${e.no_id} → ${paint(cor, e.decisao.acao.toUpperCase())}\n  ${paint('dim', e.decisao.justificativa)}`,
        );
        if (e.decisao.acao === 'expandir' && e.decisao.sub_hipoteses.length > 0) {
          for (const sub of e.decisao.sub_hipoteses) {
            console.log(`  ${paint('cyan', '↳')} ${sub.titulo}`);
          }
        }
        break;
      }
      case 'cap_atingido':
        console.log(`${ts()} ${badge('CAP', 'red')} ${e.cap} = ${e.valor} atingido — interrompendo`);
        break;
      case 'pipeline_finalizado':
        console.log(`${ts()} ${badge('FIM', 'green')} ${e.ranking.length} nó(s) no ranking`);
        break;
    }
  };
}

// ─── Relatório ──────────────────────────────────────────────────────────────

function resumirNoParaRelatorio(no: No): Record<string, unknown> {
  return {
    id: no.id,
    parent_id: no.parent_id,
    profundidade: no.profundidade,
    estado: no.estado,
    hipotese: no.hipotese,
    score_aurora: no.validador?.score_parcial_fit ?? null,
    recomendacao_aurora: no.validador?.recomendacao_playbook ?? null,
    veto_aurora: no.validador?.veto ?? false,
    tags_aurora: no.validador?.tags ?? [],
    discrepancias: no.validador?.discrepancias_founder_vs_research ?? [],
    lp_id: no.lp?.lp_id ?? null,
    lp_angulo: no.lp?.angulo ?? null,
    qtd_ads: no.ads?.qtd_ads ?? 0,
    veredito_swarm: no.veredito_swarm ?? null,
    metricas: no.performance ?? null,
    swarm_amostra_feedback: no.swarm?.respostas
      .filter((r) => !r.erro)
      .slice(0, 3)
      .map((r) => ({
        nome: r.nome,
        ocupacao: r.ocupacao,
        intencao: r.intencao_compra_0_a_10,
        pagaria: r.pagaria,
        feedback: r.feedback_qualitativo,
      })),
    decisao: no.decisao
      ? { acao: no.decisao.acao, justificativa: no.decisao.justificativa }
      : null,
    score_final: no.score_final ?? null,
    erro: no.erro ?? null,
  };
}

function gerarMarkdown(
  submissao: SubmissaoAurora,
  hipoteseRaiz: string,
  arvore: No[],
  ranking: Array<{ no: No; score_final: number }>,
  custoTotal: { calls: number; input_tokens: number; output_tokens: number; cost_usd: number },
  custoPorAgente: Record<
    string,
    { calls: number; input_tokens: number; output_tokens: number; cost_usd: number }
  >,
): string {
  const linhas: string[] = [];
  linhas.push(`# Relatório Beyond Agents — ${submissao.solucao.nome}`);
  linhas.push('');
  linhas.push(`**Vertical:** ${submissao.solucao.vertical}`);
  linhas.push(`**Hipótese raiz:** ${hipoteseRaiz}`);
  linhas.push(`**Founders:** ${submissao.founders.map((f) => f.nome).join(', ')}`);
  linhas.push(`**Gerado em:** ${new Date().toISOString()}`);
  linhas.push('');
  linhas.push('---');
  linhas.push('');
  linhas.push('## Top hipóteses (ranqueadas pelo score multivariável)');
  linhas.push('');
  if (ranking.length === 0) {
    linhas.push('_Nenhum nó atingiu score positivo. Toda a árvore foi podada._');
  } else {
    linhas.push('| # | Nó | Hipótese | Score | Aurora | Swarm |');
    linhas.push('|---|---|---|---|---|---|');
    ranking.slice(0, 3).forEach((r, i) => {
      linhas.push(
        `| ${i + 1} | ${r.no.id} | ${r.no.hipotese.titulo} | **${r.score_final.toFixed(1)}** | ${r.no.validador?.score_parcial_fit.toFixed(1) ?? '-'} | ${r.no.veredito_swarm ?? '-'} |`,
      );
    });
  }
  linhas.push('');
  linhas.push('## Árvore completa');
  linhas.push('');
  for (const no of arvore) {
    linhas.push(
      `### ${no.id} ${no.parent_id ? `(filho de ${no.parent_id})` : '(raiz)'} — \`${no.estado}\``,
    );
    linhas.push('');
    linhas.push(`- **Hipótese:** ${no.hipotese.titulo}`);
    linhas.push(`- **Público:** ${no.hipotese.publico_alvo}`);
    linhas.push(`- **Ângulo:** ${no.hipotese.angulo}`);
    if (no.validador) {
      linhas.push(
        `- **Score Aurora:** ${no.validador.score_parcial_fit.toFixed(1)} (${no.validador.recomendacao_playbook}${no.validador.veto ? ', VETO' : ''})`,
      );
    }
    if (no.lp) linhas.push(`- **LP:** ${no.lp.lp_id} (${no.lp.angulo})`);
    if (no.performance) {
      linhas.push(
        `- **Métricas swarm:** pagariam ${(no.performance.taxa_pagaria * 100).toFixed(0)}% • intenção ${no.performance.intencao_media.toFixed(1)}/10 • Sean-Ellis ${(no.performance.sean_ellis_proxy * 100).toFixed(0)}%`,
      );
    }
    if (no.decisao) linhas.push(`- **Decisão:** ${no.decisao.acao} — ${no.decisao.justificativa}`);
    if (no.score_final != null) linhas.push(`- **Score final:** **${no.score_final.toFixed(1)}**`);
    linhas.push('');
  }
  linhas.push('## Custo da execução');
  linhas.push('');
  linhas.push(`- **Chamadas totais:** ${custoTotal.calls}`);
  linhas.push(`- **Tokens input:** ${custoTotal.input_tokens.toLocaleString('pt-BR')}`);
  linhas.push(`- **Tokens output:** ${custoTotal.output_tokens.toLocaleString('pt-BR')}`);
  linhas.push(`- **Custo total:** US$ ${custoTotal.cost_usd.toFixed(4)}`);
  linhas.push('');
  linhas.push('### Custo por agente');
  linhas.push('');
  linhas.push('| Agente | Chamadas | Input tokens | Output tokens | USD |');
  linhas.push('|---|---|---|---|---|');
  for (const [agente, dados] of Object.entries(custoPorAgente)) {
    linhas.push(
      `| ${agente} | ${dados.calls} | ${dados.input_tokens} | ${dados.output_tokens} | ${dados.cost_usd.toFixed(4)} |`,
    );
  }
  return linhas.join('\n');
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(paint('red', 'ERRO: ANTHROPIC_API_KEY não definida no .env'));
    console.error('Edite o arquivo agents-platform/.env e adicione sua chave.');
    process.exit(1);
  }
  if (!existsSync(FIXTURE_PATH)) {
    console.error(paint('red', `ERRO: fixture não encontrada em ${FIXTURE_PATH}`));
    process.exit(1);
  }

  const fixture = JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8')) as {
    submissao_aurora: SubmissaoAurora;
    hipotese_raiz: string;
  };

  console.log(paint('bold', '\n━━━ Beyond Agents — Autovalidador de Ideias ━━━\n'));
  console.log(`${paint('bold', 'Solução:')} ${fixture.submissao_aurora.solucao.nome}`);
  console.log(`${paint('bold', 'Vertical:')} ${fixture.submissao_aurora.solucao.vertical}`);
  console.log(`${paint('bold', 'Hipótese raiz:')} ${fixture.hipotese_raiz}\n`);

  costTracker.reset();
  const t0 = Date.now();

  const { arvore, ranking } = await explorarArvore({
    submissao: fixture.submissao_aurora,
    hipotese_raiz: fixture.hipotese_raiz,
    listener: makeListener(),
  });

  const durMs = Date.now() - t0;
  const custoTotal = costTracker.total();
  const custoPorAgente = costTracker.byAgent();

  // ─── Resumo terminal ───
  console.log(`\n${paint('bold', '━━━ Resumo final ━━━')}\n`);
  console.log(`${paint('bold', 'Nós explorados:')} ${arvore.length}`);
  console.log(`${paint('bold', 'Tempo total:')} ${(durMs / 1000).toFixed(1)}s`);
  console.log(`${paint('bold', 'Chamadas Claude:')} ${custoTotal.calls}`);
  console.log(
    `${paint('bold', 'Tokens:')} ${custoTotal.input_tokens.toLocaleString('pt-BR')} in + ${custoTotal.output_tokens.toLocaleString('pt-BR')} out`,
  );
  console.log(`${paint('bold', 'Custo total:')} ${paint('green', `US$ ${custoTotal.cost_usd.toFixed(4)}`)}`);
  console.log('');
  if (ranking.length > 0) {
    console.log(paint('bold', 'Top 3 hipóteses:'));
    ranking.slice(0, 3).forEach((r, i) => {
      console.log(
        `  ${i + 1}. ${paint('green', r.score_final.toFixed(1))} — ${r.no.id} ${paint('dim', `(${r.no.hipotese.titulo})`)}`,
      );
    });
  } else {
    console.log(paint('yellow', 'Nenhum nó foi promovido — toda a árvore foi podada.'));
  }

  // ─── Persistir relatório ───
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const tsStr = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = resolve(OUT_DIR, `relatorio-${tsStr}.json`);
  const mdPath = resolve(OUT_DIR, `relatorio-${tsStr}.md`);
  const treePath = resolve(OUT_DIR, `arvore-${tsStr}.json`);

  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        gerado_em: new Date().toISOString(),
        duracao_ms: durMs,
        solucao: fixture.submissao_aurora.solucao.nome,
        vertical: fixture.submissao_aurora.solucao.vertical,
        hipotese_raiz: fixture.hipotese_raiz,
        custo_total: custoTotal,
        custo_por_agente: custoPorAgente,
        ranking: ranking.map((r) => ({
          no_id: r.no.id,
          score_final: r.score_final,
          hipotese: r.no.hipotese.titulo,
        })),
        arvore: arvore.map(resumirNoParaRelatorio),
      },
      null,
      2,
    ),
  );
  // Árvore completa (com HTML das LPs/Ads — usado pela UI stretch)
  writeFileSync(treePath, JSON.stringify(arvore, null, 2));
  writeFileSync(
    mdPath,
    gerarMarkdown(
      fixture.submissao_aurora,
      fixture.hipotese_raiz,
      arvore,
      ranking,
      custoTotal,
      custoPorAgente,
    ),
  );

  console.log('');
  console.log(`${paint('dim', '→ Relatório JSON:')} ${jsonPath}`);
  console.log(`${paint('dim', '→ Relatório Markdown:')} ${mdPath}`);
  console.log(`${paint('dim', '→ Árvore completa:')} ${treePath}`);
  console.log('');
}

main().catch((err) => {
  console.error(paint('red', '\nFATAL:'), err);
  process.exit(1);
});
