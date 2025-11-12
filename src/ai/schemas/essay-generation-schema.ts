
import { z } from 'zod';

export const EssayGenerationInputSchema = z.object({
  topic: z.string().describe('The topic or prompt for the essay.'),
  gradeLevel: z.string().describe('The target grade level for the essay (e.g., High School, College).'),
  rubric: z.string().optional().describe('Optional rubric or specific instructions to follow.'),
});
export type EssayGenerationInput = z.infer<typeof EssayGenerationInputSchema>;

export const EssayGenerationOutputSchema = z.object({
  essay: z.string().describe('The fully generated essay content.'),
});
export type EssayGenerationOutput = z.infer<typeof EssayGenerationOutputSchema>;
