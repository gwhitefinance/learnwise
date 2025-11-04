
'use server';
/**
 * @fileOverview An AI flow to provide feedback and coaching on college essays.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { EssayCoachInputSchema, EssayCoachOutputSchema } from '@/ai/schemas/essay-coach-schema';


const prompt = ai.definePrompt({
    name: 'essayCoachPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: EssayCoachInputSchema },
    output: { schema: EssayCoachOutputSchema },
    prompt: `You are an expert college admissions essay coach. You are supportive, insightful, and skilled at helping students turn their ideas into compelling narratives.

    A student needs your help with their college essay.

    **The Student's Current Essay Draft:**
    '''
    {{essay}}
    '''

    **Conversation History:**
    {{#if history}}
      {{#each history}}
        - {{role}}: {{content}}
      {{/each}}
    {{/if}}
    
    **The Student's Latest Request:**
    "{{prompt}}"

    **Your Task:**
    Based on the student's request and their essay draft, provide helpful, constructive, and encouraging feedback.
    - If they ask for general feedback, look for clarity, voice, and narrative structure.
    - If they ask for help brainstorming, suggest ways to connect their personal stories to broader themes.
    - If they ask about a specific paragraph, provide targeted advice.
    - If they ask to turn a story into a topic, help them identify the core theme and message.
    - Always be positive and empowering. Frame your feedback as suggestions and questions, not commands.
    - Keep responses concise and focused on the user's specific prompt.
    `,
});

const generateEssayFeedbackFlow = ai.defineFlow(
  {
    name: 'generateEssayFeedbackFlow',
    inputSchema: EssayCoachInputSchema,
    outputSchema: EssayCoachOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate essay feedback.');
    }
    return output;
  }
);

export async function generateEssayFeedback(input: z.infer<typeof EssayCoachInputSchema>): Promise<z.infer<typeof EssayCoachOutputSchema>> {
    return generateEssayFeedbackFlow(input);
}
