
/**
 * @fileoverview Defines the data schemas for the quiz generation feature.
 *
 * This file contains the Zod schemas for validating the input and structuring
 * the output of the AI-powered quiz generation flow. By centralizing these
 * schemas, we ensure consistent data validation and type safety across the
 * application.
 */
import { z } from 'zod';

export const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().default('Medium'),
  numQuestions: z.number().min(1).max(20).optional().default(5),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

export const QuizQuestionSchema = z.object({
    questionText: z.string().describe("The text of the quiz question."),
    options: z.array(z.string()).length(4).describe("An array of 4 possible answers for multiple-choice questions."),
    correctAnswerIndex: z.number().min(0).max(3).describe("The 0-based index of the correct answer in the 'options' array."),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const GenerateQuizOutputSchema = z.object({
  quizTitle: z.string().optional().describe("A title for the generated quiz."),
  questions: z.array(QuizQuestionSchema),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;
