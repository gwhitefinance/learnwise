/**
 * @fileoverview Defines the data schemas for the midterm exam generation feature.
 */
import { z } from 'zod';

export const GenerateMidtermExamInputSchema = z.object({
  courseContent: z.string().describe('The text content of the first half of the course to be converted into a midterm exam.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateMidtermExamInput = z.infer<typeof GenerateMidtermExamInputSchema>;
