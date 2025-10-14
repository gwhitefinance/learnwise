
'use server';
/**
 * @fileOverview A flow for generating summaries of notes.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { GenerateSummaryInputSchema, GenerateSummaryOutputSchema, GenerateSummaryInput, GenerateSummaryOutput } from '@/ai/schemas/note-summary-schema';

const prompt = ai.definePrompt({
    name: 'noteSummaryPrompt',
    model: googleAI.model('gemini-2.0-flash-lite'),
    input: { schema: GenerateSummaryInputSchema },
    output: { schema: GenerateSummaryOutputSchema },
    prompt: `You are an expert at summarizing text. Please provide a concise summary of the following note content. 
    The summary should capture the key points and main ideas in 2-4 sentences.

    Note Content:
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
