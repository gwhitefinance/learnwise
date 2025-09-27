
/**
 * @fileoverview Defines the data schemas for the chat-to-note generation feature.
 */
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  content: z.string(),
});

export const GenerateNoteFromChatInputSchema = z.object({
  messages: z.array(MessageSchema).describe('The full conversation history to be summarized.'),
});
export type GenerateNoteFromChatInput = z.infer<typeof GenerateNoteFromChatInputSchema>;


export const GenerateNoteFromChatOutputSchema = z.object({
  title: z.string().describe('A short, descriptive title for the generated note (4-6 words).'),
  note: z.string().describe('The summarized content of the conversation, formatted as a structured note with bullet points or lists.'),
});
export type GenerateNoteFromChatOutput = z.infer<typeof GenerateNoteFromChatOutputSchema>;
