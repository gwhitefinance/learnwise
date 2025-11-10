
'use server';
/**
 * @fileOverview A flow for generating personalized feedback on an SAT study session.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { FeedbackInputSchema, FeedbackOutputSchema, type FeedbackInput, type FeedbackOutput } from '@/ai/schemas/sat-study-session-schema';

const prompt = ai.definePrompt({
    name: 'satFeedbackPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: FeedbackInputSchema },
    output: { schema: FeedbackOutputSchema },
    prompt: `You are an expert SAT tutor named Taz, providing feedback on a student's practice set.
    Analyze the student's performance based on the questions they answered. For each question, the 'topic' is provided.

    Your task is to provide a concise (2-3 sentences) and encouraging feedback summary.
    1.  Start by acknowledging their effort (e.g., "Nice work knocking out this practice set...").
    2.  Identify ONE specific area or topic where they did well.
    3.  Identify ONE specific topic where they struggled the most (lost the most points).
    4.  Provide ONE short, actionable "Focus tip" related to their main struggling area.

    Here is the list of questions and their performance:
    {{#each answeredQuestions}}
    - Question: "{{question}}"
    - Topic: "{{topic}}"
    - Correct Answer: "{{correctAnswer}}"
    - Their Answer: "{{userAnswer}}"
    - Was it correct? {{#if isCorrect}}Yes{{else}}No{{/if}}
    {{/each}}
    `,
});

const generateFeedbackFlow = ai.defineFlow(
  {
    name: 'generateFeedbackFlow',
    inputSchema: FeedbackInputSchema,
    outputSchema: FeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate feedback.');
    }
    return output;
  }
);

export async function generateFeedbackAction(input: FeedbackInput): Promise<FeedbackOutput> {
    return generateFeedbackFlow(input);
}
