
'use server';
/**
 * @fileOverview A flow for generating a personalized mini-course structure.
 *
 * - generateMiniCourse - A function that generates a course with modules and chapters based on learner type.
 */
import { ai } from '@/ai/genkit';
import { GenerateMiniCourseInputSchema, GenerateMiniCourseOutputSchema, GenerateMiniCourseInput, GenerateMiniCourseOutput } from '@/ai/schemas/mini-course-schema';

const prompt = ai.definePrompt({
    name: 'miniCourseGenerationPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GenerateMiniCourseInputSchema },
    output: { schema: GenerateMiniCourseOutputSchema },
    prompt: `You are an expert instructional designer who creates engaging, personalized, and in-depth course outlines. 

    Your main task is to generate a complete, multi-module course outline based on the user's details.
    
    The user has provided a specific course name and description. Use these directly.
    - Course Name: {{courseName}}
    - Course Description: {{courseDescription}}

    Generate 5-7 modules for the course. Each module should represent a major topic.
    For each module, create 4-6 chapter titles.

    **CRITICAL INSTRUCTION**: Do NOT generate the 'content' or 'activity' for each chapter. Only generate the course title, module titles, and chapter titles. The content will be generated in a separate step.
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
    // Ensure content and activity are empty strings as the prompt might still generate them.
    output.modules.forEach(module => {
        module.chapters.forEach(chapter => {
            chapter.content = '';
            chapter.activity = '';
        });
    });
    return output;
  }
);

export async function generateMiniCourse(input: GenerateMiniCourseInput): Promise<GenerateMiniCourseOutput> {
    return generateMiniCourseFlow(input);
}
