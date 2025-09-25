
'use server';
/**
 * @fileOverview A flow for generating practice quizzes.
 * 
 * - generateQuiz - A function that generates a quiz based on user input.
 */

import { ai } from '@/ai/genkit';
import { GenerateQuizInput, GenerateQuizInputSchema, GenerateQuizOutput, GenerateQuizOutputSchema } from '@/ai/schemas/quiz-schema';

const prompt = ai.definePrompt({
    name: 'quizGenerationPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `Generate a {{numQuestions}}-question quiz on the following topics: {{topics}}.
    
    The quiz should have the following parameters:
    - Question Type: {{questionType}}
    - Difficulty Level: {{difficulty}}

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
