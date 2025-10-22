/**
 * @fileoverview Defines the data schemas for the SAT Study Session generation feature.
 */
import { z } from 'zod';
import { SatQuestionSchema } from './sat-question-schema';

export const SatStudySessionInputSchema = z.object({
  category: z.enum(['Math', 'Reading & Writing']),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type SatStudySessionInput = z.infer<typeof SatStudySessionInputSchema>;


export const SatStudySessionOutputSchema = z.object({
    questions: z.array(SatQuestionSchema),
});
export type SatStudySessionOutput = z.infer<typeof SatStudySessionOutputSchema>;
