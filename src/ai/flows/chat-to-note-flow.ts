
'use server';
/**
 * @fileOverview A flow for converting a chat session into a structured note.
 *
 * - generateNoteFromChat - A function that summarizes a chat and creates a note.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { GenerateNoteFromChatInputSchema, GenerateNoteFromChatOutputSchema, GenerateNoteFromChatInput, GenerateNoteFromChatOutput } from '@/ai/schemas/chat-to-note-schema';

const prompt = ai.definePrompt({
    name: 'chatToNotePrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GenerateNoteFromChatInputSchema },
    output: { schema: GenerateNoteFromChatOutputSchema },
    prompt: `You are an expert at summarizing conversations and creating structured notes.
    Based on the following chat session, generate a concise and informative note.

    The note should have:
    1.  A short, descriptive **title** (4-6 words) that captures the main topic.
    2.  A structured **note** body with the main points, questions, and answers from the conversation. Use bullet points (using a '-' dash) or numbered lists for clarity. DO NOT use markdown formatting like '*' or '#'.

    Conversation History:
    {{#each messages}}
      **{{role}}**: {{content}}
    {{/each}}

    Extract the key information and present it as a useful study note.
    `,
});


const generateNoteFromChatFlow = ai.defineFlow(
  {
    name: 'generateNoteFromChatFlow',
    inputSchema: GenerateNoteFromChatInputSchema,
    outputSchema: GenerateNoteFromChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate note from chat.');
    }
    return output;
  }
);

export async function generateNoteFromChat(input: GenerateNoteFromChatInput): Promise<GenerateNoteFromChatOutput> {
    return generateNoteFromChatFlow(input);
}
