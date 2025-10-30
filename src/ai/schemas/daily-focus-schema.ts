
import { z } from 'zod';

export const GenerateDailyFocusInputSchema = z.object({
  courseNames: z.array(z.string()).describe("A list of the user's current course names."),
  weakestTopics: z.array(z.string()).optional().describe("A list of topics the user struggles with."),
});
export type GenerateDailyFocusInput = z.infer<typeof GenerateDailyFocusInputSchema>;

export const GenerateDailyFocusOutputSchema = z.object({
  tasks: z.array(z.string()).length(5).describe('An array of exactly 5 actionable study tasks for the day.'),
});
export type GenerateDailyFocusOutput = z.infer<typeof GenerateDailyFocusOutputSchema>;
