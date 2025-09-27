
/**
 * @fileoverview Defines the data schemas for the module-to-quiz generation feature.
 */
import { z } from 'zod';

export const GenerateModuleQuizInputSchema = z.object({
  moduleContent: z.string().describe('The text content of all chapters in the module to be converted into a quiz.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateModuleQuizInput = z.infer<typeof GenerateModuleQuizInputSchema>;
