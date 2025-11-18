
'use server';
/**
 * @fileOverview A flow for generating a personalized mini-course structure.
 *
 * - generateMiniCourse - A function that generates a course with units and chapters based on learner type.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateMiniCourseInputSchema, GenerateMiniCourseOutputSchema, GenerateMiniCourseInput, GenerateMiniCourseOutput } from '@/ai/schemas/mini-course-schema';

const prompt = ai.definePrompt({
    name: 'miniCourseGenerationPrompt',
    model: googleAI.model('gemini-2.5-pro'),
    input: { schema: GenerateMiniCourseInputSchema },
    output: { schema: GenerateMiniCourseOutputSchema },
    prompt: `You are an expert instructional designer who creates engaging, personalized course outlines.

    Your main task is to generate a course structure based on the user's details.

    - Course Name: {{courseName}}
    - Course Description: {{courseDescription}}

    **CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:**
    1.  **Generate Key Concepts**: Based on the course name and description, identify and list 5-7 of the most important keywords or concepts for this subject.
    2.  **Generate 7-10 units for the course.** Each unit must represent a major, distinct topic.
    3.  **For EACH of those units, you must create 5-7 chapter titles.**
    4.  **Add a "Unit Quiz" chapter to the end of EACH unit's chapter list.**
    5.  **DO NOT** generate the content, activities, or interactive tools for the chapters. Your ONLY job is to create the course title, key concepts, unit titles, and chapter titles. The content will be generated later.
    `,
});


const generateMiniCourseFlow = ai.defineFlow(
  {
    name: 'generateMiniCourseFlow',
    inputSchema: GenerateMiniCourseInputSchema,
    outputSchema: GenerateMiniCourseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate mini-course outline.');
    }
    // The model sometimes uses 'modules' instead of 'units'. We'll correct it here.
    return {
        courseTitle: output.courseTitle,
        keyConcepts: output.keyConcepts,
        modules: (output.modules || []).map(unit => ({
            title: unit.title,
            chapters: unit.chapters
        }))
    };
  }
);

export async function generateMiniCourse(input: GenerateMiniCourseInput): Promise<GenerateMiniCourseOutput> {
    return generateMiniCourseFlow(input);
}
