
/**
 * @fileoverview Defines the data schemas for the advanced flashcard generation feature.
 */
import { z } from 'zod';

export const GenerateFlashcardsInputSchema = z.object({
  noteContent: z.string().describe('The text content of the note to be converted into flashcards.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;


const FlashcardSchema = z.object({
  front: z.string().describe('The front of the flashcard (e.g., a term or question).'),
  back: z.string().describe('The back of the flashcard (e.g., a definition or answer).'),
  distractors: z.array(z.string()).length(3).describe('An array of three plausible but incorrect answers to be used as multiple-choice options.'),
});

export const GenerateFlashcardsOutputSchema = z.object({
    flashcards: z.array(FlashcardSchema),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;
