
'use server';
/**
 * @fileOverview A flow for generating a personalized mini-course.
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
    prompt: `You are an expert instructional designer who creates engaging, personalized, and in-depth courses. 

    Your main task is to generate a complete, multi-module course based on the user's details. The user wants a full, comprehensive course, not a "mini" one.
    
    The user has provided a specific course name and description. Use these directly.
    - Course Name: {{courseName}}
    - Course Description: {{courseDescription}}

    Generate a 5-7 module course. Each module should represent a major topic or unit within the course, suitable for a comprehensive study plan.

    For each module, create 4-6 detailed chapters. The chapters within a module should be structured progressively, starting with foundational concepts and building upon them.

    **CRITICAL INSTRUCTION**: Each chapter's "content" field MUST be extremely detailed and long-form. It should consist of at least 5-7 substantial paragraphs that thoroughly explain the topic. Do not provide short summaries. The goal is to create a rich, comprehensive, and word-heavy educational resource for the user to study.
    
    The user is a {{learnerType}} learner. Tailor the content and activities for each chapter accordingly, using encouraging and slightly gamified language:
    - For Visual learners, the content should be very descriptive, using metaphors and analogies to paint a picture. Activities should involve creating diagrams, mind maps, or finding and analyzing videos (suggest specific topics to search for).
    - For Auditory learners, content should be conversational, like a script for a podcast. Activities could involve listening to a podcast on the topic, or explaining the concept out loud to a friend or a rubber duck.
    - For Kinesthetic learners, activities must be hands-on and interactive. Suggest things like building a small model, performing a practical exercise, creating a simple game based on the concepts, or relating the topic to a physical task they can perform.
    - For Reading/Writing learners, provide clear, well-structured, text-based explanations and suggest activities like writing detailed summaries, creating outlines, or answering essay-style questions.

    For each module, provide a title.
    For each chapter within a module, provide a title, the main educational content (which should be detailed and comprehensive), and a tailored, interactive activity.
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
