
'use server';
/**
 * @fileOverview A flow for generating a title for a chat session.
 *
 * - generateChatTitle - A function that generates a title based on conversation history.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  content: z.string(),
});

const GenerateChatTitleInputSchema = z.object({
  messages: z.array(MessageSchema),
});
export type GenerateChatTitleInput = z.infer<typeof GenerateChatTitleInputSchema>;

const GenerateChatTitleOutputSchema = z.object({
  title: z.string().describe('A short, descriptive title for the chat session (3-5 words).'),
});
export type GenerateChatTitleOutput = z.infer<typeof GenerateChatTitleOutputSchema>;


const prompt = ai.definePrompt({
    name: 'chatTitlePrompt',
    model: googleAI.model('gemini-2.0-flash-lite'),
    input: { schema: GenerateChatTitleInputSchema },
    output: { schema: GenerateChatTitleOutputSchema },
    prompt: `Based on the following conversation, create a short, descriptive title (3-5 words). 
    Focus on the main topic or question. Do not include the user's or AI's name.

    Conversation:
    {{#each messages}}
      {{role}}: {{content}}
    {{/each}}
    `,
});

const generateChatTitleFlow = ai.defineFlow(
  {
    name: 'generateChatTitleFlow',
    inputSchema: GenerateChatTitleInputSchema,
    outputSchema: GenerateChatTitleOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate chat title.');
    }
    return output;
  }
);

export async function generateChatTitle(input: GenerateChatTitleInput): Promise<GenerateChatTitleOutput> {
    return generateChatTitleFlow(input);
}
