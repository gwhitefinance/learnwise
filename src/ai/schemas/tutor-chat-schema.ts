
import { z } from 'zod';

export const TutorChatInputSchema = z.object({
  chapterContext: z.string().describe('The full text content of the chapter the user is asking about.'),
  question: z.string().describe('The user\'s question about the chapter content.'),
});
export type TutorChatInput = z.infer<typeof TutorChatInputSchema>;

export const TutorChatOutputSchema = z.object({
  answer: z.string().describe('A helpful and direct answer to the user\'s question, based on the provided chapter context.'),
});
export type TutorChatOutput = z.infer<typeof TutorChatOutputSchema>;
