
/**
 * @fileoverview Defines the data schemas for the quiz explanation feature.
 */
import { z } from 'zod';

export const GenerateExplanationInputSchema = z.object({
  question: z.string().describe('The quiz question that was answered.'),
  userAnswer: z.string().describe("The user's incorrect answer."),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
  provideFullExplanation: z.boolean().optional().default(true).describe('When true, provide a full explanation and a practice question. When false, provide only a new practice question.'),
});
export type GenerateExplanationInput = z.infer<typeof GenerateExplanationInputSchema>;


export const PracticeQuestionSchema = z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
});


export const GenerateExplanationOutputSchema = z.object({
  explanation: z.string().describe('The tailored explanation for the user. This will be an empty string if provideFullExplanation was false.'),
  practiceQuestion: PracticeQuestionSchema.describe("A new practice question that is similar to the one the user got wrong, but with different values or context."),
});
export type GenerateExplanationOutput = z.infer<typeof GenerateExplanationOutputSchema>;
