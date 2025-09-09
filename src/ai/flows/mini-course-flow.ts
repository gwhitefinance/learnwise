
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
    prompt: `You are an expert instructional designer who creates engaging, personalized, and in-depth courses. 
    Generate a 5-7 module course based on the provided course name and description. Make it feel like a full, comprehensive course, not just a brief overview.
    
    The modules should be structured progressively, starting with foundational concepts and building upon them in subsequent modules. Each module should contain detailed, long-form content that thoroughly explains the topic for that chapter.

    The user is a {{learnerType}} learner. Tailor the content and activities for each module accordingly, using encouraging and slightly gamified language:
    - For Visual learners, the content should be very descriptive, using metaphors and analogies to paint a picture. Activities should involve creating diagrams, mind maps, or finding and analyzing videos (suggest specific topics to search for).
    - For Auditory learners, content should be conversational, like a script for a podcast. Activities could involve listening to a podcast on the topic, or explaining the concept out loud to a friend or a rubber duck.
    - For Kinesthetic learners, activities must be hands-on and interactive. Suggest things like building a small model, performing a practical exercise, creating a simple game based on the concepts, or relating the topic to a physical task they can perform.
    - For Reading/Writing learners, provide clear, well-structured, text-based explanations and suggest activities like writing detailed summaries, creating outlines, or answering essay-style questions.

    Course Name: {{courseName}}
    Course Description: {{courseDescription}}

    For each module, provide a title, the main educational content (which should be detailed and comprehensive), and a tailored, interactive activity.
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
