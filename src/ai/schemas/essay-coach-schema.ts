
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  content: z.string(),
});

export const EssayCoachInputSchema = z.object({
  essay: z.string().describe("The current draft of the user's college essay."),
  prompt: z.string().describe("The user's specific question or request for feedback."),
  history: z.array(MessageSchema).optional().describe('The conversation history so far.'),
});

export const EssayCoachOutputSchema = z.object({
  feedback: z.string().describe("Constructive, encouraging, and actionable feedback on the user's essay based on their prompt."),
});
