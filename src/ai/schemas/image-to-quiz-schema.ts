
import { z } from 'zod';

export const GenerateImageQuizInputSchema = z.object({
  imageDataUri: z.string().describe("The image to generate the quiz from, as a data URI."),
  numQuestions: z.number().min(1).max(20).optional().default(5),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().default('Medium'),
});

export type GenerateImageQuizInput = z.infer<typeof GenerateImageQuizInputSchema>;
