
/**
 * @fileoverview Defines the data schemas for the note summarization feature.
 */
import { z } from 'zod';

export const GenerateSummaryInputSchema = z.object({
  noteContent: z.string().describe('The text content of the note to be summarized.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;


export const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the note.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;
