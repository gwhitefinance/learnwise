/**
 * @fileoverview Defines the data schemas for the note-to-quiz generation feature.
 */
import { z } from 'zod';

export const GenerateNoteQuizInputSchema = z.object({
  noteContent: z.string().describe('The text content of the note to be converted into a quiz.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateNoteQuizInput = z.infer<typeof GenerateNoteQuizInputSchema>;
