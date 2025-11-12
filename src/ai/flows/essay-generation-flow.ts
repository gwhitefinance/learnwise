
'use server';
/**
 * @fileOverview An AI flow to generate an essay based on a prompt.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { EssayGenerationInputSchema, EssayGenerationOutputSchema, type EssayGenerationInput, type EssayGenerationOutput } from '@/ai/schemas/essay-generation-schema';

const prompt = ai.definePrompt({
    name: 'essayGenerationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: EssayGenerationInputSchema },
    output: { schema: EssayGenerationOutputSchema },
    prompt: `You are an expert academic writer. Your task is to write a well-structured essay based on the provided details.

    **Topic**: {{topic}}
    **Grade Level**: {{gradeLevel}}
    **Rubric/Instructions**:
    {{#if rubric}}
    {{rubric}}
    {{else}}
    Please write a standard 5-paragraph essay with a clear introduction, three body paragraphs with supporting details, and a strong conclusion.
    {{/if}}

    Write the essay now. Ensure the tone and vocabulary are appropriate for the specified grade level.
    `,
});

const generateEssayFlow = ai.defineFlow(
  {
    name: 'generateEssayFlow',
    inputSchema: EssayGenerationInputSchema,
    outputSchema: EssayGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate essay.');
    }
    return output;
  }
);

export async function generateEssay(input: EssayGenerationInput): Promise<EssayGenerationOutput> {
    return generateEssayFlow(input);
}
