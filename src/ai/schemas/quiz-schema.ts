/**
 * @fileoverview Defines the data schemas for the quiz generation feature.
 *
 * This file contains the Zod schemas for validating the input and structuring
 * the output of the AI-powered quiz generation flow. By centralizing these
 * schemas, we ensure consistent data validation and type safety across the
 * application.
 *
 * - `GenerateQuizInputSchema`: Validates the parameters for generating a quiz,
 *   such as topics, question type, difficulty, and number of questions.
 * - `GenerateQuizOutputSchema`: Defines the expected structure of the
 *   generated quiz, including the list of questions, options, and answers.
 */
import { z } from 'zod';

export const GenerateQuizInputSchema = z.object({
  topics: z.string().describe('The topics or keywords for the quiz.'),
  questionType: z.enum(['Multiple Choice', 'True/False', 'Short Answer', 'Free Response (FRQ)', 'Fill in the Blank']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  numQuestions: z.number().min(1).max(20),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

export const QuizQuestionSchema = z.object({
    question: z.string(),
    options: z.array(z.string()).optional(),
    answer: z.string(),
    type: z.string().optional().describe("The type of question, added programmatically."),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;
