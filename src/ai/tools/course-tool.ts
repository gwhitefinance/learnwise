
'use server';
/**
 * @fileOverview A Genkit tool for retrieving course information.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CourseSchema = z.object({
    id: z.string(),
    name: z.string(),
    instructor: z.string(),
    credits: z.number(),
    url: z.string().optional(),
});

const initialCourses = [
    {
        id: '1',
        name: "Introduction to Programming",
        instructor: "Dr. Emily Carter",
        credits: 3,
        url: 'https://www.coursera.org/specializations/python'
    },
    {
        id: '2',
        name: "Calculus I",
        instructor: "Prof. David Lee",
        credits: 4,
        url: ''
    },
    {
        id: '3',
        name: "Linear Algebra",
        instructor: "Dr. Sarah Jones",
        credits: 3,
        url: ''
    },
];

export const getCoursesTool = ai.defineTool(
    {
        name: 'getCoursesTool',
        description: 'Get a list of the user\'s current courses, including name, instructor, and URL.',
        inputSchema: z.object({}),
        outputSchema: z.array(CourseSchema),
    },
    async () => {
        // In a real application, you would fetch this data from a database
        // or a shared state management solution.
        // For this example, we'll read it from localStorage if available,
        // otherwise we'll use the initial hardcoded data.
        
        // Since this is a server-side tool, it doesn't have direct access to the browser's localStorage.
        // This is a limitation of this example setup.
        // A real implementation would involve a proper database.
        // We will return the initial courses for now.
        console.log("Fetching courses for AI...");
        return initialCourses;
    }
);
