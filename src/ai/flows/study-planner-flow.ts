
'use server';
/**
 * @fileOverview A simple AI flow for creating study plans.
 * 
 * - studyPlannerFlow - A function that takes a user prompt and returns a study plan.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  content: z.string(),
});

const StudyPlannerInputSchema = z.object({
    history: z.array(MessageSchema),
    learnerType: z.string().optional(),
});

const prompt = ai.definePrompt({
    name: 'studyPlannerPrompt',
    input: { schema: StudyPlannerInputSchema },
    prompt: `You are a friendly and conversational AI study partner. Your goal is to help users learn and plan their studies. Keep your responses concise but detailed, and avoid using markdown formatting like bolding with asterisks. Be encouraging and supportive.
    
    {{#if learnerType}}
    The user is a {{learnerType}} learner. Remember to tailor your response to their learning style:
    - For Visual learners, use descriptions that help them visualize things. Suggest diagrams, charts, and videos.
    - For Auditory learners, suggest listening to lectures, discussions, and using mnemonic devices.
    - For Kinesthetic learners, recommend hands-on activities, real-world examples, and interactive exercises.
    {{/if}}
    
    Here is the conversation history:
    {{#each history}}
        {{#if (eq role 'user')}}
        User: {{content}}
        {{else}}
        AI: {{content}}
        {{/if}}
    {{/each}}
    
    Based on the conversation, provide a helpful and conversational response to the latest user message.
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
