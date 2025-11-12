
'use server';
/**
 * @fileOverview A flow for generating a concise summary of a given text.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { GenerateSummaryInputSchema, GenerateSummaryOutputSchema, GenerateSummaryInput, GenerateSummaryOutput } from '@/ai/schemas/summary-schema';


const prompt = ai.definePrompt({
    name: 'summaryPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GenerateSummaryInputSchema },
    output: { schema: GenerateSummaryOutputSchema },
    prompt: `You are an expert at creating concise summaries.
    Based on the following text content, generate a 2-3 sentence summary that captures the main points.

    Content to summarize:
    "{{noteContent}}"
    `,
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: GenerateSummaryInputSchema,
    outputSchema: GenerateSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate summary.');
    }
    return output;
  }
);

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
    return generateSummaryFlow(input);
}
