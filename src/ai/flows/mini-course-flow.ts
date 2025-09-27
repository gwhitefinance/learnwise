
'use server';
/**
 * @fileOverview A flow for generating a personalized mini-course structure.
 *
 * - generateMiniCourse - A function that generates a course with modules and chapters based on learner type.
 */
import { ai, googleAI } from '@/ai/genkit';
import { GenerateMiniCourseInputSchema, GenerateMiniCourseOutputSchema, GenerateMiniCourseInput, GenerateMiniCourseOutput } from '@/ai/schemas/mini-course-schema';

const prompt = ai.definePrompt({
    name: 'miniCourseGenerationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GenerateMiniCourseInputSchema },
    output: { schema: GenerateMiniCourseOutputSchema },
    prompt: `You are an expert instructional designer who creates engaging, personalized course outlines.

    Your main task is to generate a course structure based on the user's details.

    - Course Name: {{courseName}}
    - Course Description: {{courseDescription}}

    **CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:**
    1.  **Generate 7-10 modules for the course.** Each module must represent a major, distinct topic.
    2.  **For EACH of those modules, you must create 5-7 chapter titles.**
    3.  **Add a "Module Quiz" chapter to the end of EACH module's chapter list.**
    4.  **DO NOT** generate the content, activities, or interactive tools for the chapters. Your ONLY job is to create the course title, module titles, and chapter titles. The content will be generated later.
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
    return output;
  }
);

export async function generateMiniCourse(input: GenerateMiniCourseInput): Promise<GenerateMiniCourseOutput> {
    return generateMiniCourseFlow(input);
}
