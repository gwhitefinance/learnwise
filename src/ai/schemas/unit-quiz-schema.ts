
/**
 * @fileoverview Defines the data schemas for the unit-to-quiz generation feature.
 */
import { z } from 'zod';

export const GenerateUnitQuizInputSchema = z.object({
  unitContent: z.string().describe('The text content of all chapters in the unit to be converted into a quiz.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateUnitQuizInput = z.infer<typeof GenerateUnitQuizInputSchema>;
