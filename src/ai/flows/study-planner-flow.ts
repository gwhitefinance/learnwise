
'use server';
/**
 * @fileOverview A simple AI flow for creating study plans.
 * 
 * - studyPlannerFlow - A function that takes a user prompt and returns a study plan.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StudyPlannerInputSchema = z.string();
const StudyPlannerOutputSchema = z.string();

const prompt = ai.definePrompt({
    name: 'studyPlannerPrompt',
    input: { schema: StudyPlannerInputSchema },
    output: { schema: StudyPlannerOutputSchema },
    prompt: `You are an expert academic advisor. A student has asked for help.
    
    Based on their request, create a concise, actionable study plan.
    Use markdown for formatting. For example:

    **Study Plan for Biology Exam**

    *   **Tomorrow:** Review chapters 1-3. Focus on vocabulary.
    *   **Day after:** Practice chapter quizzes.
    *   **Two days before exam:** Take a full practice test.

    Here is the student's request:
    {{{prompt}}}
    `,
});

export const studyPlannerFlow = ai.defineFlow(
  {
    name: 'studyPlannerFlow',
    inputSchema: StudyPlannerInputSchema,
    outputSchema: StudyPlannerOutputSchema,
  },
  async (promptText) => {
    const { output } = await prompt(promptText);
    return output!;
  }
);
