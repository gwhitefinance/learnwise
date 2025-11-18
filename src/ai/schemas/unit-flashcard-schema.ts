
/**
 * @fileoverview Defines the data schemas for the unit-to-flashcard generation feature.
 */
import { z } from 'zod';

export const GenerateUnitFlashcardsInputSchema = z.object({
  unitContent: z.string().describe('The text content of the unit to be converted into flashcards.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateUnitFlashcardsInput = z.infer<typeof GenerateUnitFlashcardsInputSchema>;
