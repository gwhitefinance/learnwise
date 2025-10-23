
/**
 * @fileoverview Defines the data schemas for the quiz hint generation feature.
 */
import { z } from 'zod';

export const GenerateHintInputSchema = z.object({
  question: z.string().describe('The quiz question the user needs a hint for.'),
  options: z.array(z.string()).describe('The multiple-choice options for the question.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
});
export type GenerateHintInput = z.infer<typeof GenerateHintInputSchema>;


export const GenerateHintOutputSchema = z.object({
  hint: z.string().describe('A short, helpful hint that guides the user without giving away the answer.'),
});
export type GenerateHintOutput = z.infer<typeof GenerateHintOutputSchema>;
