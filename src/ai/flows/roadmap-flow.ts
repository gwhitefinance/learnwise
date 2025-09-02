
'use server';
/**
 * @fileOverview A flow for generating a study roadmap for a course.
 *
 * - generateRoadmap - A function that generates goals and milestones for a course.
 */
import { ai } from '@/ai/genkit';
import { GenerateRoadmapInputSchema, GenerateRoadmapOutputSchema, GenerateRoadmapInput, GenerateRoadmapOutput } from '@/ai/schemas/roadmap-schema';

const prompt = ai.definePrompt({
    name: 'roadmapGenerationPrompt',
    input: { schema: GenerateRoadmapInputSchema },
    output: { schema: GenerateRoadmapOutputSchema },
    prompt: `You are an expert academic advisor. Generate a detailed study roadmap with 3-4 high-level goals and 5-6 specific, dated milestones for the following course:

    Course Name: {{courseName}}
    {{#if courseDescription}}
    Course Description: {{courseDescription}}
    {{/if}}

    The roadmap should start from today's date. The milestones should be spread out logically over a 3-month period.
    Provide clear, actionable goals and milestones.
    For milestone dates, use YYYY-MM-DD format.
    `,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate roadmap.');
    }
    return output;
  }
);

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
    return generateRoadmapFlow(input);
}
