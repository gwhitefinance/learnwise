
'use server';
/**
 * @fileOverview A simple AI flow for creating study plans.
 * 
 * - studyPlannerFlow - A function that takes a user prompt and returns a study plan.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StudyPlannerInputSchema = z.object({
    promptText: z.string(),
    learnerType: z.string().optional(),
});

const prompt = ai.definePrompt({
    name: 'studyPlannerPrompt',
    input: { schema: StudyPlannerInputSchema },
    prompt: `You are a helpful AI assistant. Respond to the user's request.
    {{#if learnerType}}
    The user is a {{learnerType}} learner. Tailor your response to their learning style.
    - For Visual learners, use descriptions that help them visualize, suggest diagrams, charts, and videos.
    - For Auditory learners, suggest listening to lectures, discussions, and using mnemonic devices.
    - For Kinesthetic learners, recommend hands-on activities, real-world examples, and interactive exercises.
    {{/if}}
    
    User request:
    {{promptText}}
    `,
});

export const studyPlannerFlow = ai.defineFlow(
  {
    name: 'studyPlannerFlow',
    inputSchema: StudyPlannerInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const response = await prompt(input);

    return response.text ?? "I'm sorry, I am unable to answer that question. Please try rephrasing it.";
  }
);
