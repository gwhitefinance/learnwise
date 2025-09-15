
'use server';
/**
 * @fileOverview A flow for providing contextual answers to questions about a specific text.
 *
 * - generateTutorResponse - A function that generates an answer based on chapter content and a user's question.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TutorChatInputSchema = z.object({
  chapterContext: z.string().describe('The full text content of the chapter the user is asking about.'),
  question: z.string().describe('The user\'s question about the chapter content.'),
});
export type TutorChatInput = z.infer<typeof TutorChatInputSchema>;

const TutorChatOutputSchema = z.object({
  answer: z.string().describe('A helpful and direct answer to the user\'s question, based on the provided chapter context.'),
});
export type TutorChatOutput = z.infer<typeof TutorChatOutputSchema>;


const prompt = ai.definePrompt({
    name: 'tutorChatPrompt',
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
