
'use server';
/**
 * @fileOverview A flow for generating a personalized onboarding mini-course.
 *
 * - generateOnboardingCourse - Generates a course with modules and chapters based on user interests.
 */
import { ai, googleAI } from '@/ai/genkit';
import { GenerateOnboardingCourseInputSchema, GenerateOnboardingCourseOutputSchema, GenerateOnboardingCourseInput, GenerateOnboardingCourseOutput } from '@/ai/schemas/onboarding-course-schema';

const prompt = ai.definePrompt({
    name: 'onboardingCourseGenerationPrompt',
    model: googleAI.model('gemini-1.5-flash'),
    input: { schema: GenerateOnboardingCourseInputSchema },
    output: { schema: GenerateOnboardingCourseOutputSchema },
    prompt: `You are an expert instructional designer who creates exciting, personalized starter courses for new users.

    Your main task is to generate a creative course concept based on a user's interest and grade level.

    - User's Grade Level: {{gradeLevel}}
    - User's Interest: {{interest}}
    
    The course name should be catchy and inspiring. Then, write a compelling course description (one paragraph) that explains what the course is about.

    Example for an Elementary schooler interested in 'Dinosaurs':
    Course Title: "Dino-Mite Adventure: A Journey Through Time"
    Course Description: "Roar! Get ready to stomp back in time and meet the giants who ruled the Earth. In this course, we'll dig up fossils, learn about the mighty T-Rex, and discover what life was like in the age of dinosaurs. It's going to be a dino-mite adventure!"

    Do NOT generate the full course content, modules, or chapters. Only generate the course title and description.
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
        throw new Error('Failed to generate onboarding course concept.');
    }
    return output;
  }
);

export async function generateOnboardingCourse(input: GenerateOnboardingCourseInput): Promise<GenerateOnboardingCourseOutput> {
    return generateOnboardingCourseFlow(input);
}
