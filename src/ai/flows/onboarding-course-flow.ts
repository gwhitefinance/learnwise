
'use server';
/**
 * @fileOverview A flow for generating a personalized onboarding mini-course.
 *
 * - generateOnboardingCourse - Generates a course with modules and chapters based on user interests.
 */
import { ai } from '@/ai/genkit';
import { GenerateOnboardingCourseInputSchema, GenerateOnboardingCourseOutputSchema, GenerateOnboardingCourseInput, GenerateOnboardingCourseOutput } from '@/ai/schemas/onboarding-course-schema';

const prompt = ai.definePrompt({
    name: 'onboardingCourseGenerationPrompt',
    input: { schema: GenerateOnboardingCourseInputSchema },
    output: { schema: GenerateOnboardingCourseOutputSchema },
    prompt: `You are an expert instructional designer who creates exciting, personalized starter courses for new users.

    Your main task is to generate a complete mini-course based on a single user interest and their grade level.

    First, come up with a creative and engaging course concept that explores the user's interest.
    - User's Grade Level: {{gradeLevel}}
    - User's Interest: {{interest}}
    The course name should be catchy and inspiring. Then, write a compelling course description that explains what the course is about.

    Example for an Elementary schooler interested in 'Dinosaurs':
    Course Title: "Dino-Mite Adventure: A Journey Through Time"
    Course Description: "Roar! Get ready to stomp back in time and meet the giants who ruled the Earth. In this course, we'll dig up fossils, learn about the mighty T-Rex, and discover what life was like in the age of dinosaurs. It's going to be a dino-mite adventure!"

    After creating the title and description, proceed to generate the course content.
    Generate a 3-module course. Each module should represent a major topic within the course.

    For each module, create 3-4 chapters. The chapters should be structured progressively, starting with foundational concepts and building upon them. Each chapter must contain detailed, long-form content.
    
    The user's learning style is currently unknown, so create content that is generally engaging and balanced. Use encouraging and slightly gamified language. Include a variety of suggested activities: some visual (like drawing a diagram), some hands-on (like a simple at-home experiment), and some writing-based (like summarizing a concept).

    For each module, provide a title.
    For each chapter, provide a title, the main educational content, and a tailored, interactive activity.
    `,
});


const generateOnboardingCourseFlow = ai.defineFlow(
  {
    name: 'generateOnboardingCourseFlow',
    inputSchema: GenerateOnboardingCourseInputSchema,
    outputSchema: GenerateOnboardingCourseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate onboarding course.');
    }
    return output;
  }
);

export async function generateOnboardingCourse(input: GenerateOnboardingCourseInput): Promise<GenerateOnboardingCourseOutput> {
    return generateOnboardingCourseFlow(input);
}
