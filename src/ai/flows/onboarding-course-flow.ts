
'use server';
/**
 * @fileOverview A flow for generating a personalized starter course during onboarding.
 *
 * - generateOnboardingCourse - A function that generates a course based on grade level and interests.
 */
import { ai } from '@/ai/genkit';
import { GenerateOnboardingCourseInput, GenerateOnboardingCourseInputSchema, GenerateOnboardingCourseOutput, GenerateOnboardingCourseOutputSchema } from '@/ai/schemas/onboarding-course-schema';


const prompt = ai.definePrompt({
    name: 'onboardingCoursePrompt',
    input: { schema: GenerateOnboardingCourseInputSchema },
    output: { schema: GenerateOnboardingCourseOutputSchema },
    prompt: `You are an expert curriculum designer who creates exciting and accessible introductory courses.
    
    A new user has just signed up. Your task is to generate a single, compelling starter course for them based on their interests and grade level.
    
    User's Grade Level: {{gradeLevel}}
    User's Interests: {{interests}}

    Based on this, generate:
    1.  A short, catchy, and inspiring Course Name. It should combine some of the interests in a creative way.
    2.  A detailed, engaging, and welcoming Course Description (2-3 paragraphs). This description should:
        - Acknowledge their interests.
        - Explain how the course will explore the connections between these interests.
        - Be tailored to the specified grade level (e.g., use simpler language for Elementary, more complex for College).
        - Set a positive and exciting tone for their learning journey.

    Example for Elementary schooler interested in Space, Dinosaurs, and Art:
    Course Name: "Galactic Dino Artists"
    Course Description: "Welcome, explorer! Get ready for an adventure where we travel back in time to draw mighty dinosaurs and then blast off into space to paint swirling galaxies. In this course, we'll learn how to sketch a T-Rex, design our own amazing planets, and discover the secrets of the stars. It's time to let your imagination run wild and become a master artist of the past and future!"
    `,
});

const generateOnboardingCourseFlow = ai.defineFlow(
  {
    name: 'generateOnboardingCourseFlow',
    inputSchema: GenerateOnboardingCourseInputSchema,
    outputSchema: GenerateOnboardingCourseOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
        prompt: prompt.prompt,
        model: 'googleai/gemini-pro',
        input: input,
        output: { schema: GenerateOnboardingCourseOutputSchema }
    });

    if (!output) {
        throw new Error('Failed to generate onboarding course.');
    }
    return output;
  }
);

export async function generateOnboardingCourse(input: GenerateOnboardingCourseInput): Promise<GenerateOnboardingCourseOutput> {
    return generateOnboardingCourseFlow(input);
}
