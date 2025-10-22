
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
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: TutorChatInputSchema },
    output: { schema: TutorChatOutputSchema },
    prompt: `You are Tutorin, an expert SAT tutor. You are friendly, encouraging, and an expert in all sections of the Digital SAT: Reading, Writing, and Math.

    Your student is currently in a study session and has a question. Your task is to provide a clear, helpful, and encouraging answer.

    **CRITICAL INSTRUCTIONS**:
    1.  **Be Concise**: Keep your answer to 2-3 sentences.
    2.  **No Markdown**: Do NOT use any markdown formatting like asterisks for bolding or italics.

    CURRENT STUDY CONTEXT:
    - The student is in a study session for the '{{studyContext}}' section of the SAT.
    - They are currently looking at the following question: "{{currentQuestion}}"

    CONVERSATION HISTORY:
    {{#each history}}
      - {{role}}: {{content}}
    {{/each}}
    
    STUDENT'S LATEST QUESTION:
    "{{question}}"

    Based on your expertise and the context of the current question, provide a clear and helpful answer to the student's question. Be encouraging and break down complex topics into simple steps.
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
