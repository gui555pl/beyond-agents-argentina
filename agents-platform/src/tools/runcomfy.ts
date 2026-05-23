/**
 * Tool Runcomfy — geração de imagem via API HTTP.
 *
 * ⚠️  PLACEHOLDER: o shape de request/response abaixo foi inferido do handoff
 *     e ainda NÃO foi conferido contra o contrato real usado pelo VolundOS.
 *     Antes do primeiro uso em produção, ajustar:
 *       - body do POST (campos dentro de `inputs`)
 *       - parsing do response (caminho até `image_url`)
 *       - método de auth (Bearer vs header customizado)
 *
 * Contrato assumido:
 *   POST {RUNCOMFY_API_URL}
 *   Headers: Authorization: Bearer {RUNCOMFY_API_KEY}
 *   Body:    { inputs: { prompt, negative_prompt, width, height } }
 *   Reply:   { run_id: string, outputs: { image_url: string } }
 */
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const inputSchema = z.object({
  prompt: z
    .string()
    .min(1)
    .describe(
      'Prompt de difusão denso. Inclua estilo, iluminação, composição, paleta, qualidade. Pt-br ou inglês.',
    ),
  negative_prompt: z
    .string()
    .optional()
    .describe('O que evitar na imagem (artefatos, deformações, watermarks etc).'),
  width: z.number().int().positive().default(1024).describe('Largura em pixels.'),
  height: z.number().int().positive().default(1024).describe('Altura em pixels.'),
});

const outputSchema = z.object({
  imageUrl: z.string().url().describe('URL pública da imagem gerada.'),
  runId: z.string().describe('Identificador do job na Runcomfy.'),
});

export const runcomfyTool = createTool({
  id: 'runcomfy',
  description:
    'Gera uma imagem a partir de um prompt de difusão denso. Use somente quando o briefing já estiver refinado em termos de estilo, iluminação, composição, paleta e formato.',
  inputSchema,
  outputSchema,
  execute: async (inputData) => {
    const apiUrl = process.env.RUNCOMFY_API_URL;
    const apiKey = process.env.RUNCOMFY_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error(
        'Runcomfy não configurada: defina RUNCOMFY_API_URL e RUNCOMFY_API_KEY no .env.',
      );
    }

    const body = {
      inputs: {
        prompt: inputData.prompt,
        negative_prompt: inputData.negative_prompt ?? '',
        width: inputData.width,
        height: inputData.height,
      },
    };

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Runcomfy falhou (${res.status}): ${detail || res.statusText}`);
    }

    const data = (await res.json()) as {
      run_id?: string;
      outputs?: { image_url?: string };
    };

    const imageUrl = data.outputs?.image_url;
    const runId = data.run_id;

    if (!imageUrl || !runId) {
      throw new Error(
        `Resposta Runcomfy sem campos esperados (run_id/outputs.image_url): ${JSON.stringify(data)}`,
      );
    }

    return { imageUrl, runId };
  },
});
