
'use server';
/**
 * @fileOverview A simple AI flow for creating study plans.
 * 
 * - studyPlannerFlow - A function that takes a user prompt and returns a study plan.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StudyPlannerInputSchema = z.string();
const StudyPlannerOutputSchema = z.string().nullable();

const prompt = ai.definePrompt({
    name: 'studyPlannerPrompt',
    input: { schema: z.object({prompt: StudyPlannerInputSchema}) },
    output: { schema: StudyPlannerOutputSchema },
    prompt: `You are a helpful AI assistant. Respond to the user's request.
    
    User request:
    {{{prompt}}}
    `,
});

export const studyPlannerFlow = ai.defineFlow(
  {
    name: 'studyPlannerFlow',
    inputSchema: StudyPlannerInputSchema,
    outputSchema: z.string(),
  },
  async (promptText) => {
    const { output } = await prompt({prompt: promptText});
    return output ?? "I'm sorry, I am unable to answer that question. Please try rephrasing it.";
  }
);
