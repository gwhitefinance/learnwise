import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  content: z.string(),
});

export const TutorChatInputSchema = z.object({
  studyContext: z.string().describe('The topic of the current study session (e.g., "SAT Math", "Reading & Writing").'),
  question: z.string().describe('The user\'s question.'),
  history: z.array(MessageSchema).optional().describe('The conversation history so far.'),
});
export type TutorChatInput = z.infer<typeof TutorChatInputSchema>;

export const TutorChatOutputSchema = z.object({
  answer: z.string().describe('A helpful and direct answer to the user\'s question, based on the provided chapter context.'),
});
export type TutorChatOutput = z.infer<typeof TutorChatOutputSchema>;
