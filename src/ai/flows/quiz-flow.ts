
'use server';
/**
 * @fileOverview A flow for generating practice quizzes.
 * 
 * - generateQuiz - A function that generates a quiz based on user input.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateQuizInput, GenerateQuizInputSchema, GenerateQuizOutput, GenerateQuizOutputSchema } from '@/ai/schemas/quiz-schema';

const prompt = ai.definePrompt({
    name: 'quizGenerationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `Generate a {{numQuestions}}-question quiz on the following topics: {{topics}}.
    
    The quiz should have the following parameters:
    - Question Type: {{questionType}}
    - Difficulty Level: {{difficulty}}

    **CRITICAL**: For any mathematical expressions, especially exponents and fractions, use proper notation. For example, use 'x²' instead of 'x^2', and use Unicode characters like '½' for fractions instead of '1/2'.

    For each question, provide the question text, options (if multiple choice), and the correct answer.
    `,
});


const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate quiz.');
    }
    return output;
  }
);

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
    return generateQuizFlow(input);
}
