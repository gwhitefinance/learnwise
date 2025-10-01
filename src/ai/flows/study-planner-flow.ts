

'use server';
/**
 * @fileOverview A simple AI flow for creating study plans.
 * 
 * - studyPlannerFlow - A function that takes a user prompt and returns a study plan.
 */
import { ai, googleAI } from '@/ai/genkit';
import { getCoursesTool } from '@/ai/tools/course-tool';
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  content: z.string(),
});

const EventSchema = z.object({
    id: z.string(),
    date: z.string().describe("The event date in ISO format."),
    title: z.string(),
    time: z.string(),
    type: z.enum(['Test', 'Homework', 'Quiz', 'Event', 'Project']),
    description: z.string(),
});


const StudyPlannerInputSchema = z.object({
    userName: z.string().optional().describe("The user's first name."),
    history: z.array(MessageSchema),
    learnerType: z.string().optional(),
    courseContext: z.string().optional().describe('The name and description of the course the user is asking about.'),
    calendarEvents: z.array(EventSchema).optional().describe('A list of the user\'s upcoming calendar events.'),
});

const prompt = ai.definePrompt({
    name: 'studyPlannerPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: StudyPlannerInputSchema },
    tools: [getCoursesTool],
    prompt: `You are a friendly and conversational AI study partner named LearnWise. Your goal is to help users learn and plan their studies. 
    
    {{#if userName}}
    The user's name is {{userName}}. 
    **IMPORTANT**: Address the user by name ONLY in the first message of a new conversation, or if they greet you first (e.g., they say "hi"). Do not repeat their name in every response.
    {{/if}}

    Keep your responses concise but detailed, and avoid using markdown formatting like bolding with asterisks. Be encouraging and supportive.

    If the user asks about their courses, use the getCoursesTool to retrieve the information and provide it to them. You can provide the links to the courses if they ask for it.

    If the user asks about their schedule, what they have coming up, or anything about their calendar, use the provided calendar events to answer their questions.
    
    Here are the user's upcoming events:
    {{#if calendarEvents}}
        {{#each calendarEvents}}
         - {{this.title}} on {{this.date}} at {{this.time}} (Type: {{this.type}})
        {{/each}}
    {{else}}
        No upcoming events.
    {{/if}}

    {{#if courseContext}}
    The user is currently focused on the following course: {{courseContext}}. Tailor your suggestions and study plans to this specific course.
    {{/if}}

    {{#if learnerType}}
    The user is a {{learnerType}} learner. Remember to tailor your response to their learning style:
    - For Visual learners, use descriptions that help them visualize things. Suggest diagrams, charts, and videos.
    - For Auditory learners, suggest listening to lectures, discussions, and using mnemonic devices.
    - For Kinesthetic learners, recommend hands-on activities, real-world examples, and interactive exercises.
    {{/if}}
    
    Here is the conversation history:
    {{#each history}}
      {{role}}: {{content}}
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



