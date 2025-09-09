
'use server';
/**
 * @fileOverview A flow for generating explanations for quiz questions.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateExplanationInputSchema, GenerateExplanationOutputSchema, GenerateExplanationInput, GenerateExplanationOutput } from '@/ai/schemas/quiz-explanation-schema';

const prompt = ai.definePrompt({
    name: 'quizExplanationPrompt',
    input: { schema: GenerateExplanationInputSchema },
    output: { schema: GenerateExplanationOutputSchema },
    prompt: `You are an expert tutor. A student has answered a quiz question incorrectly. 
    Your task is to provide a clear, encouraging, and helpful explanation.

    The user's learning style is {{learnerType}}. Tailor your explanation accordingly:
    - For Visual learners, use descriptive language that helps them visualize the concept. Suggest creating a diagram or chart.
    - For Auditory learners, explain it as if you were speaking to them. Suggest saying the key concepts out loud.
    - For Kinesthetic learners, relate the concept to a real-world example or a physical action. Suggest a hands-on activity.

    Question: "{{question}}"
    Their Answer: "{{userAnswer}}"
    Correct Answer: "{{correctAnswer}}"

    Explain why their answer is incorrect and how to arrive at the correct answer. Keep the tone positive and supportive. Do not just give the answer away. Guide them to the correct thinking process.
    `,
});

const generateExplanationFlow = ai.defineFlow(
  {
    name: 'generateExplanationFlow',
    inputSchema: GenerateExplanationInputSchema,
    outputSchema: GenerateExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate explanation.');
    }
    return output;
  }
);

export async function generateExplanation(input: GenerateExplanationInput): Promise<GenerateExplanationOutput> {
    return generateExplanationFlow(input);
}
