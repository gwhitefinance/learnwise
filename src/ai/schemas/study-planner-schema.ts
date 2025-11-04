
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

export const StudyPlannerInputSchema = z.object({
    userName: z.string().optional().describe("The user's first name."),
    aiBuddyName: z.string().optional().describe("The user's custom name for the AI buddy. Defaults to Tutorin."),
    history: z.array(MessageSchema),
    learnerType: z.string().optional(),
    allCourses: z.array(z.object({ id: z.string(), name: z.string(), description: z.string() })).optional().describe('A list of all courses the user is enrolled in.'),
    courseContext: z.string().optional().describe('The name and description of the specific course the user is currently viewing, if any.'),
    calendarEvents: z.array(EventSchema).optional().describe('A list of the user\'s upcoming calendar events.'),
});

export type StudyPlannerInput = z.infer<typeof StudyPlannerInputSchema>;
