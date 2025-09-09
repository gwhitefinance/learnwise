
/**
 * @fileoverview Defines the data schemas for the quiz explanation feature.
 */
import { z } from 'zod';

export const GenerateExplanationInputSchema = z.object({
  question: z.string().describe('The quiz question that was answered.'),
  userAnswer: z.string().describe("The user's incorrect answer."),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateExplanationInput = z.infer<typeof GenerateExplanationInputSchema>;


export const GenerateExplanationOutputSchema = z.object({
  explanation: z.string().describe('The tailored explanation for the user.'),
});
export type GenerateExplanationOutput = z.infer<typeof GenerateExplanationOutputSchema>;
