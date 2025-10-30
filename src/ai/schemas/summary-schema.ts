
import { z } from 'zod';

export const GenerateSummaryInputSchema = z.object({
  noteContent: z.string().describe('The text content of the note to be summarized.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;


export const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise, 2-3 sentence summary of the provided text.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;
