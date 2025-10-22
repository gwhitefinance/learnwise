/**
 * @fileoverview Defines the data schemas for the SAT Study Session generation feature.
 */
import { z } from 'zod';
import { SatQuestionSchema } from './sat-question-schema';

// Define AnswerFeedbackSchema directly in this file
export const AnswerFeedbackSchema = z.object({
  question: z.string(),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  isCorrect: z.boolean(),
});

export const SatStudySessionInputSchema = z.object({
  category: z.enum(['Math', 'Reading & Writing']),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type SatStudySessionInput = z.infer<typeof SatStudySessionInputSchema>;


export const SatStudySessionOutputSchema = z.object({
    questions: z.array(SatQuestionSchema),
});
export type SatStudySessionOutput = z.infer<typeof SatStudySessionOutputSchema>;

export const FeedbackInputSchema = z.object({
    answeredQuestions: z.array(AnswerFeedbackSchema),
});
export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;

export const FeedbackOutputSchema = z.object({
    feedback: z.string().describe("A 2-3 sentence summary of the student's performance, highlighting one strength and one area for improvement."),
});
export type FeedbackOutput = z.infer<typeof FeedbackOutputSchema>;
