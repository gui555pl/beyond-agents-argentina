/**
 * Miro Fish swarm — dispara N personas Claude em paralelo contra uma LP.
 *
 * Coração da demo: cada persona é uma chamada Claude Haiku (rápida e barata)
 * que recebe o HTML da LP truncado + descrição da própria persona, e devolve
 * JSON estruturado com a sua avaliação.
 *
 * Paralelização com p-limit para respeitar rate limit. Falhas individuais
 * não derrubam o swarm — viram entradas { erro: true } e são filtradas pelo
 * Performance Analyst.
 */
import pLimit from 'p-limit';
import { callAgent, extractJson } from '../lib/anthropic-client.js';

const MODELO_SWARM = 'claude-haiku-4-5';
// Concurrency mais conservadora pra evitar 429 de input tokens/min.
const CONCURRENCY = 3;
// Trunca a LP com agressividade para reduzir payload por persona.
const LP_HTML_MAX_CHARS = 3_500;
const MAX_RETRIES_429 = 2;

export interface Persona {
  id: string;
  nome: string;
  idade: number;
  ocupacao: string;
  dor_principal: string;
  intencao_de_compra_baseline: number;
  vies: string;
}

export interface RespostaPersona {
  persona_id: string;
  nome: string;
  ocupacao: string;
  achei_interessante: boolean;
  clicaria_no_cta: boolean;
  pagaria: boolean;
  intencao_compra_0_a_10: number;
  feedback_qualitativo: string;
  erro?: string;
}

export interface SwarmResultado {
  lp_id: string;
  respostas: RespostaPersona[];
  total_personas: number;
  erros: number;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + '\n<!-- truncado -->';
}

function buildSystem(): string {
  return [
    'Você está simulando uma pessoa específica avaliando uma landing page de produto.',
    'Sua avaliação deve ser honesta, refletir a personalidade descrita, e respeitar o viés cognitivo da persona.',
    'NUNCA quebre personagem. NUNCA explique que é uma IA.',
    'Devolva EXCLUSIVAMENTE um objeto JSON válido — sem prosa antes ou depois, sem markdown.',
  ].join(' ');
}

function buildUser(persona: Persona, lpHtml: string, contextoExtra?: string): string {
  return `# Sua identidade
- Nome: ${persona.nome}
- Idade: ${persona.idade}
- Ocupação: ${persona.ocupacao}
- Dor principal: ${persona.dor_principal}
- Sua intenção de compra geral (baseline 0-10): ${persona.intencao_de_compra_baseline}
- Seu viés: ${persona.vies}

# Landing page que você está avaliando

\`\`\`html
${truncate(lpHtml, LP_HTML_MAX_CHARS)}
\`\`\`
${contextoExtra ? `\n# Contexto extra\n${contextoExtra}\n` : ''}
# Sua tarefa

Avalie esta LP como esta pessoa. Considere:
- A copy fala com você? (dor, ângulo, linguagem)
- O preço, se exposto, cabe na sua realidade?
- O CTA é claro e você clicaria?
- A oferta convence sua dor específica?

Devolva APENAS este JSON (sem mais nada):
{
  "achei_interessante": true | false,
  "clicaria_no_cta": true | false,
  "pagaria": true | false,
  "intencao_compra_0_a_10": <inteiro 0-10>,
  "feedback_qualitativo": "<1-2 frases curtas em primeira pessoa, no estilo da persona>"
}`;
}

async function avaliarPersona(
  persona: Persona,
  lpHtml: string,
  contextoExtra: string | undefined,
): Promise<RespostaPersona> {
  let attempt = 0;
  while (attempt <= MAX_RETRIES_429) {
    try {
      const raw = await callAgent({
        agente: 'miro-fish',
        modelo: MODELO_SWARM,
        system: buildSystem(),
        user: buildUser(persona, lpHtml, contextoExtra),
        max_tokens: 220,
        temperature: 0.85,
      });
      const parsed = extractJson<{
        achei_interessante: boolean;
        clicaria_no_cta: boolean;
        pagaria: boolean;
        intencao_compra_0_a_10: number;
        feedback_qualitativo: string;
      }>(raw);
      return {
        persona_id: persona.id,
        nome: persona.nome,
        ocupacao: persona.ocupacao,
        achei_interessante: !!parsed.achei_interessante,
        clicaria_no_cta: !!parsed.clicaria_no_cta,
        pagaria: !!parsed.pagaria,
        intencao_compra_0_a_10: Math.max(
          0,
          Math.min(10, Math.round(parsed.intencao_compra_0_a_10)),
        ),
        feedback_qualitativo: String(parsed.feedback_qualitativo ?? ''),
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const is429 = msg.includes('429') || msg.toLowerCase().includes('rate_limit');
      if (is429 && attempt < MAX_RETRIES_429) {
        const delayMs = 900 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        attempt += 1;
        continue;
      }
      return {
        persona_id: persona.id,
        nome: persona.nome,
        ocupacao: persona.ocupacao,
        achei_interessante: false,
        clicaria_no_cta: false,
        pagaria: false,
        intencao_compra_0_a_10: 0,
        feedback_qualitativo: '',
        erro: msg,
      };
    }
  }
  return {
    persona_id: persona.id,
    nome: persona.nome,
    ocupacao: persona.ocupacao,
    achei_interessante: false,
    clicaria_no_cta: false,
    pagaria: false,
    intencao_compra_0_a_10: 0,
    feedback_qualitativo: '',
    erro: 'Falha no swarm sem detalhes.',
  };
}

export interface RunSwarmParams {
  lp_id: string;
  lp_html: string;
  personas: Persona[];
  contexto_extra?: string;
  onProgress?: (resposta: RespostaPersona, indice: number, total: number) => void;
}

export async function runSwarm({
  lp_id,
  lp_html,
  personas,
  contexto_extra,
  onProgress,
}: RunSwarmParams): Promise<SwarmResultado> {
  const limit = pLimit(CONCURRENCY);
  let done = 0;
  const total = personas.length;
  const respostas = await Promise.all(
    personas.map((p) =>
      limit(async () => {
        const r = await avaliarPersona(p, lp_html, contexto_extra);
        done++;
        if (onProgress) onProgress(r, done, total);
        return r;
      }),
    ),
  );
  return {
    lp_id,
    respostas,
    total_personas: total,
    erros: respostas.filter((r) => r.erro).length,
  };
}
