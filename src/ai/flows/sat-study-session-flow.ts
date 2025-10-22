
'use server';
/**
 * @fileOverview A flow for generating a 10-question, high-difficulty SAT study session.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { SatQuestionSchema } from '@/ai/schemas/sat-question-schema';
import { SatStudySessionInputSchema, SatStudySessionOutputSchema, SatStudySessionInput, SatStudySessionOutput } from '@/ai/schemas/sat-study-session-schema';


const prompt = ai.definePrompt({
    name: 'satStudySessionPrompt',
    model: googleAI.model('gemini-2.0-flash'),
    input: { schema: SatStudySessionInputSchema },
    output: { schema: SatStudySessionOutputSchema },
    prompt: `You are an expert SAT test creator. Your task is to generate a 10-question, high-difficulty, SAT-level practice study session.

    - The session should focus exclusively on the requested category: {{category}}.
    - All questions must be multiple-choice with exactly four options (A, B, C, D).
    - For 'Reading & Writing' questions, you MUST include a relevant passage for each question as context. The passage should be concise but provide enough information to answer the question.
    - Provide a clear and concise explanation for why the correct answer is correct, tailored to a {{learnerType}} learner.

    Generate the 10 questions, each with four options, the correct answer, the category, an optional passage, and the explanation.
    `,
});


const generateSatStudySessionFlow = ai.defineFlow(
  {
    name: 'generateSatStudySessionFlow',
    inputSchema: SatStudySessionInputSchema,
    outputSchema: SatStudySessionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate SAT study session.');
    }
    return output;
  }
);

export async function generateSatStudySession(input: SatStudySessionInput): Promise<SatStudySessionOutput> {
    return generateSatStudySessionFlow(input);
}
