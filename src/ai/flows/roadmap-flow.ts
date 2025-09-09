
'use server';
/**
 * @fileOverview A flow for generating a study roadmap for a course.
 *
 * - generateRoadmap - A function that generates goals and milestones for a course.
 */
import { ai } from '@/ai/genkit';
import { GenerateRoadmapInputSchema, GenerateRoadmapOutputSchema, GenerateRoadmapInput, GenerateRoadmapOutput } from '@/ai/schemas/roadmap-schema';
import { scrapeWebpageTool } from '@/ai/tools/web-scraper-tool';

const prompt = ai.definePrompt({
    name: 'roadmapGenerationPrompt',
    input: { schema: GenerateRoadmapInputSchema },
    output: { schema: GenerateRoadmapOutputSchema },
    tools: [scrapeWebpageTool],
    prompt: `You are an expert academic advisor. Generate a detailed study roadmap with 3-4 high-level goals and 5-6 specific, dated milestones for the following course.

    Course Name: {{courseName}}
    {{#if courseDescription}}
    Course Description: {{courseDescription}}
    {{/if}}

    Use the provided web content as the primary source of information for the course details.
    
    The roadmap should start from today's date, which is {{currentDate}}. The milestones should be spread out logically over a 3-month period from this date.
    Provide clear, actionable goals and milestones.
    For milestone dates, use YYYY-MM-DD format and ensure they are all in the future.
    `,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async (input) => {
    let webContent = '';
    if (input.courseUrl) {
        try {
            webContent = await scrapeWebpageTool({ url: input.courseUrl });
        } catch (error) {
            console.warn(`Could not scrape ${input.courseUrl}:`, error);
            // Continue without web content if scraping fails
        }
    }
    
    const { output } = await prompt({
        ...input,
        currentDate: new Date().toISOString().split('T')[0],
        webContent: webContent || 'No additional content available.',
    });
    if (!output) {
        throw new Error('Failed to generate roadmap.');
    }
    return output;
  }
);

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
    return generateRoadmapFlow(input);
}
