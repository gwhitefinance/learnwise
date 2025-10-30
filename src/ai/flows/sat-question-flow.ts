
'use server';
/**
 * @fileOverview A flow for generating a daily SAT practice question.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { SatQuestionSchema, GenerateSatQuestionInputSchema, GenerateSatQuestionInput, type SatQuestion } from '@/ai/schemas/sat-question-schema';

const prompt = ai.definePrompt({
    name: 'satQuestionPrompt',
    model: googleAI.model('gemini-2.0-flash'),
    input: { schema: GenerateSatQuestionInputSchema },
    output: { schema: SatQuestionSchema },
    prompt: `You are an expert SAT test creator. Your task is to generate a single, high-quality, challenging SAT-level practice question that mirrors the difficulty of the hardest questions on the official digital SAT.

    - The question should be unique based on the provided seed: "{{seed}}".
    - You must alternate between 'Math' and 'Reading & Writing' categories daily. Use the provided seed to decide. If the seed's length is even, create a 'Math' question. If odd, create a 'Reading & Writing' question.
    - **CRITICAL**: For any mathematical expressions, especially exponents, use proper notation. For example, use 'x²' instead of 'x^2'.
    - For 'Reading & Writing' questions, you may optionally include a short passage (1-3 sentences) if it's relevant to the question.
    - All questions must be multiple-choice with exactly four options (A, B, C, D).
    - Provide a clear and concise explanation for why the correct answer is correct, tailored to a {{learnerType}} learner.
    - Assign a difficulty ('Easy', 'Medium', 'Hard'), a main 'topic', and a more specific 'subTopic'.

    Generate the question, the four options, the correct answer, the category, an optional passage, and the explanation.
    `,
});


const generateSatQuestionFlow = ai.defineFlow(
  {
    name: 'generateSatQuestionFlow',
    inputSchema: GenerateSatQuestionInputSchema,
    outputSchema: SatQuestionSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate SAT question.');
    }
    return output;
  }
);

export async function generateSatQuestion(input: GenerateSatQuestionInput): Promise<SatQuestion> {
    return generateSatQuestionFlow(input);
}
