
/**
 * @fileoverview Defines the data schemas for the module-to-flashcard generation feature.
 */
import { z } from 'zod';

export const GenerateModuleFlashcardsInputSchema = z.object({
  moduleContent: z.string().describe('The text content of the module to be converted into flashcards.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateModuleFlashcardsInput = z.infer<typeof GenerateModuleFlashcardsInputSchema>;
