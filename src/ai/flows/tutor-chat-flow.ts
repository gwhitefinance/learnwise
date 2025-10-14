
'use server';
/**
 * @fileOverview A flow for providing contextual answers to questions about a specific text.
 *
 * - generateTutorResponse - A function that generates an answer based on chapter content and a user's question.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { TutorChatInputSchema, TutorChatOutputSchema, TutorChatInput, TutorChatOutput } from '@/ai/schemas/tutor-chat-schema';

const prompt = ai.definePrompt({
    name: 'tutorChatPrompt',
    model: googleAI.model('gemini-2.0-flash-lite'),
    input: { schema: TutorChatInputSchema },
    output: { schema: TutorChatOutputSchema },
    prompt: `You are an AI Tutor. Your student is currently reading a chapter and has a question. 
    Your task is to answer their question based *only* on the provided chapter content.
    Keep your answer concise and directly related to the text.

    Here is the content of the chapter they are reading:
    ---
    {{chapterContext}}
    ---

    Here is the student's question:
    "{{question}}"

    Provide a clear and helpful answer.
    `,
});

const generateTutorResponseFlow = ai.defineFlow(
  {
    name: 'generateTutorResponseFlow',
    inputSchema: TutorChatInputSchema,
    outputSchema: TutorChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate tutor response.');
    }
    return output;
  }
);

export async function generateTutorResponse(input: TutorChatInput): Promise<TutorChatOutput> {
    return generateTutorResponseFlow(input);
}
