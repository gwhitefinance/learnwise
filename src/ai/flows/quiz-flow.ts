
'use server';
/**
 * @fileOverview A flow for generating practice quizzes.
 * 
 * - generateQuiz - A function that generates a quiz based on user input.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GenerateQuizInputSchema = z.object({
  topics: z.string().describe('The topics or keywords for the quiz.'),
  questionType: z.enum(['Multiple Choice', 'True/False', 'Short Answer']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  numQuestions: z.number().min(1).max(20),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuizQuestionSchema = z.object({
    question: z.string(),
    options: z.array(z.string()).optional(),
    answer: z.string(),
});

export const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


const prompt = ai.definePrompt({
    name: 'quizGenerationPrompt',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `Generate a {{numQuestions}}-question quiz on the following topics: {{topics}}.
    
    The quiz should have the following parameters:
    - Question Type: {{questionType}}
    - Difficulty Level: {{difficulty}}

    For each question, provide the question text, options (if multiple choice), and the correct answer.
    `,
});


export const generateQuiz = ai.defineFlow(
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
