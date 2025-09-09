
'use server';
/**
 * @fileOverview A flow for generating a personalized mini-course.
 *
 * - generateMiniCourse - A function that generates a course with modules based on learner type.
 */
import { ai } from '@/ai/genkit';
import { GenerateMiniCourseInputSchema, GenerateMiniCourseOutputSchema, GenerateMiniCourseInput, GenerateMiniCourseOutput } from '@/ai/schemas/mini-course-schema';

const prompt = ai.definePrompt({
    name: 'miniCourseGenerationPrompt',
    input: { schema: GenerateMiniCourseInputSchema },
    output: { schema: GenerateMiniCourseOutputSchema },
    prompt: `You are an expert instructional designer who creates personalized mini-courses. 
    Generate a 3-4 module mini-course based on the provided course name and description.

    The user is a {{learnerType}} learner. Tailor the content and activities for each module accordingly:
    - For Visual learners, the content should be descriptive and paint a picture. Activities should involve creating diagrams, watching videos (suggest topics), or using visual aids.
    - For Auditory learners, content should be conversational. Activities could be listening to a podcast on the topic, or explaining the concept out loud.
    - For Kinesthetic learners, activities should be hands-on, like building a small model, doing a practical exercise, or relating the concept to a physical task.
    - For Reading/Writing learners, provide clear, text-based explanations and suggest activities like writing summaries or taking detailed notes.

    Course Name: {{courseName}}
    Course Description: {{courseDescription}}

    For each module, provide a title, the main content, and a tailored activity.
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
        throw new Error('Failed to generate mini-course.');
    }
    return output;
  }
);

export async function generateMiniCourse(input: GenerateMiniCourseInput): Promise<GenerateMiniCourseOutput> {
    return generateMiniCourseFlow(input);
}
