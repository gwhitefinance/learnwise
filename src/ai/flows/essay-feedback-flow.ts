
'use server';
/**
 * @fileOverview An AI flow to provide feedback and coaching on college essays.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { EssayCoachInputSchema, EssayCoachOutputSchema, EssayGradeInputSchema, EssayGradeOutputSchema } from '@/ai/schemas/essay-feedback-schema';


const feedbackPrompt = ai.definePrompt({
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

const gradingPrompt = ai.definePrompt({
    name: 'essayGradingPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: EssayGradeInputSchema },
    output: { schema: EssayGradeOutputSchema },
    prompt: `You are an expert AI teaching assistant specializing in essay evaluation.
    Your task is to grade the provided essay based on the given rubric and grade level.

    **Grade Level:** {{gradeLevel}}
    **Rubric:** {{rubric}}
    
    **Essay Content:**
    '''
    {{essay}}
    '''

    **Instructions:**

    1.  **Overall Score:** Provide a single integer score from 0 to 100 that reflects the overall quality of the essay based on all criteria.
    2.  **Feedback Breakdown:** For each of the following criteria (Thesis, Introduction, Body/Evidence), provide a specific percentage score (0-100) reflecting how well the essay performs in that area.
    3.  **Suggestions for Improvement:** Identify 2-3 of the most critical areas for improvement. For each area:
        -   Give it a clear title (e.g., "Thesis", "Body/Evidence", "Structure").
        -   Quote the specific, original text from the essay that needs improvement.
        -   Provide a "Suggested Rewrite" that demonstrates how to improve that specific part. Make your rewrite clear, concise, and constructive.

    Your feedback should be fair, balanced, and actionable to help the student learn and improve their writing.
    `
});

const generateEssayFeedbackFlow = ai.defineFlow(
  {
    name: 'generateEssayFeedbackFlow',
    inputSchema: EssayCoachInputSchema,
    outputSchema: EssayCoachOutputSchema,
  },
  async (input) => {
    const { output } = await feedbackPrompt(input);
    if (!output) {
        throw new Error('Failed to generate essay feedback.');
    }
    return output;
  }
);

const generateEssayGradeFlow = ai.defineFlow(
  {
    name: 'generateEssayGradeFlow',
    inputSchema: EssayGradeInputSchema,
    outputSchema: EssayGradeOutputSchema,
  },
  async (input) => {
    const { output } = await gradingPrompt(input);
    if (!output) {
        throw new Error('Failed to generate essay grade.');
    }
    return output;
  }
);

export async function generateEssayFeedback(input: z.infer<typeof EssayCoachInputSchema>): Promise<z.infer<typeof EssayCoachOutputSchema>> {
    return generateEssayFeedbackFlow(input);
}

export async function generateEssayGrade(input: z.infer<typeof EssayGradeInputSchema>): Promise<z.infer<typeof EssayGradeOutputSchema>> {
    return generateEssayGradeFlow(input);
}
