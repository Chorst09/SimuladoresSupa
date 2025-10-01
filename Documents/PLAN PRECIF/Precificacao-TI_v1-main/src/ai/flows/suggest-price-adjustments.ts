// src/ai/flows/suggest-price-adjustments.ts
'use server';

/**
 * @fileOverview Este arquivo define um fluxo Genkit para sugerir ajustes de preços com base na análise de mercado e preços da concorrência.
 *
 * Ele exporta:
 * - `suggestPriceAdjustments`: Uma função assíncrona que recebe dados de preços e retorna os ajustes sugeridos.
 * - `SuggestPriceAdjustmentsInput`: O tipo de entrada para a função suggestPriceAdjustments.
 * - `SuggestPriceAdjustmentsOutput`: O tipo de saída para a função suggestPriceAdjustments.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPriceAdjustmentsInputSchema = z.object({
  productDescription: z.string().describe('Descrição do produto ou serviço.'),
  currentPrice: z.number().describe('O preço atual do produto ou serviço.'),
  marketAnalysis: z.string().describe('Dados recentes de análise de mercado, incluindo demanda e tendências.'),
  competitorPricing: z.string().describe('Informações de preços de produtos ou serviços similares oferecidos por concorrentes.'),
});
export type SuggestPriceAdjustmentsInput = z.infer<typeof SuggestPriceAdjustmentsInputSchema>;

const SuggestPriceAdjustmentsOutputSchema = z.object({
  suggestedAdjustment: z.number().describe('O ajuste de preço sugerido, pode ser positivo ou negativo.'),
  reasoning: z.string().describe('A justificativa para o ajuste de preço sugerido.'),
});
export type SuggestPriceAdjustmentsOutput = z.infer<typeof SuggestPriceAdjustmentsOutputSchema>;

export async function suggestPriceAdjustments(input: SuggestPriceAdjustmentsInput): Promise<SuggestPriceAdjustmentsOutput> {
  return suggestPriceAdjustmentsFlow(input);
}

const suggestPriceAdjustmentsPrompt = ai.definePrompt({
  name: 'suggestPriceAdjustmentsPrompt',
  input: {schema: SuggestPriceAdjustmentsInputSchema},
  output: {schema: SuggestPriceAdjustmentsOutputSchema},
  prompt: `Você é um especialista em estratégia de preços. Analise os dados de mercado e os preços da concorrência fornecidos para sugerir um ajuste de preço ideal para o produto ou serviço em questão.

Descrição do Produto: {{{productDescription}}}
Preço Atual: {{{currentPrice}}}
Análise de Mercado: {{{marketAnalysis}}}
Preços da Concorrência: {{{competitorPricing}}}

Com base nessas informações, forneça um ajuste de preço sugerido e uma explicação clara para sua recomendação.
`,
});

const suggestPriceAdjustmentsFlow = ai.defineFlow(
  {
    name: 'suggestPriceAdjustmentsFlow',
    inputSchema: SuggestPriceAdjustmentsInputSchema,
    outputSchema: SuggestPriceAdjustmentsOutputSchema,
  },
  async input => {
    const {output} = await suggestPriceAdjustmentsPrompt(input);
    return output!;
  }
);
