
'use server';
/**
 * @fileOverview A flow for generating a list of 5 daily focus tasks.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateDailyFocusInput, GenerateDailyFocusInputSchema, GenerateDailyFocusOutput, GenerateDailyFocusOutputSchema } from '@/ai/schemas/daily-focus-schema';


const prompt = ai.definePrompt({
    name: 'generateDailyFocusPrompt',
    model: googleAI.model('gemini-2.0-flash-lite'),
    input: { schema: GenerateDailyFocusInputSchema },
    output: { schema: GenerateDailyFocusOutputSchema },
    prompt: `You are a helpful and concise academic advisor. Your task is to generate a list of exactly 5 specific, actionable study tasks for a student to complete today.

    Prioritize tasks related to their self-identified "weakest topics" if provided. Otherwise, create a balanced list across their current courses.

    -   User's Courses: {{#each courseNames}} - {{this}} {{/each}}
    -   User's Weakest Topics: {{#if weakestTopics}} {{#each weakestTopics}} - {{this}} {{/each}} {{else}} None specified {{/if}}

    **Instructions**:
    1.  Generate **EXACTLY 5** tasks.
    2.  Each task should be a short, clear action item (e.g., "Review Chapter 3 of Biology," "Complete 10 algebra practice problems," "Outline the intro for your history essay").
    3.  Do not add any preamble or conclusion. Just provide the list of 5 tasks.
    `,
});

const generateDailyFocusFlow = ai.defineFlow(
  {
    name: 'generateDailyFocusFlow',
    inputSchema: GenerateDailyFocusInputSchema,
    outputSchema: GenerateDailyFocusOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate daily focus tasks.');
    }
    return output;
  }
);


export async function generateDailyFocus(input: GenerateDailyFocusInput): Promise<GenerateDailyFocusOutput> {
    return generateDailyFocusFlow(input);
}
