/**
 * @fileoverview Defines the data schemas for the SAT feedback feature.
 */
import { z } from 'zod';

export const AnswerFeedbackSchema = z.object({
  question: z.string(),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  isCorrect: z.boolean(),
});
export type AnswerFeedback = z.infer<typeof AnswerFeedbackSchema>;
