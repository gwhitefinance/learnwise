
'use server';
/**
 * @fileOverview A flow for generating a study roadmap for a course.
 *
 * - generateRoadmap - A function that generates goals and milestones for a course.
 */
import { ai, googleAI } from '@/ai/genkit';
import { GenerateRoadmapInputSchema, GenerateRoadmapOutputSchema, GenerateRoadmapInput, GenerateRoadmapOutput } from '@/ai/schemas/roadmap-schema';
import { scrapeWebpageTool } from '@/ai/tools/web-scraper-tool';

const prompt = ai.definePrompt({
    name: 'roadmapGenerationPrompt',
    model: googleAI.model('gemini-2.5-pro'),
    input: { schema: GenerateRoadmapInputSchema },
    output: { schema: GenerateRoadmapOutputSchema },
    tools: [scrapeWebpageTool],
    prompt: `You are an expert academic advisor. Your task is to create a comprehensive, in-depth study roadmap.

    Course Information:
    - Course Name: {{courseName}}
    {{#if courseDescription}}
    - Course Description: {{courseDescription}}
    {{/if}}

    Use the provided web content as the primary source of information if available. Otherwise, use the course name and description.
    {{{webContent}}}
    
    Instructions:
    1.  **Goals:** Generate 3-4 high-level, aspirational goals for what a student should achieve by the end of the course. These are the big-picture outcomes.
    2.  **Milestones:** Generate a detailed list of 6-8 specific, sequential milestones. Each milestone must represent a distinct unit, topic, or major concept required to master the subject. The titles should be clear and descriptive (e.g., "Understanding Core Concepts", "Advanced Techniques", "Final Project Preparation").
    3.  **Dates:** The roadmap should start from today's date, which is {{currentDate}}. Spread the milestones logically over the specified number of months (defaulting to 3 months if not provided). Use {{durationInMonths}} as the number of months.
    4.  **Icons:** Assign a relevant 'lucide-react' icon name to each goal and milestone.

    Provide clear, actionable goals and milestones. For milestone dates, use YYYY-MM-DD format and ensure they are all in the future.
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
    if (input.courseUrl && input.courseUrl.trim() !== '') {
        try {
            webContent = await scrapeWebpageTool({ url: input.courseUrl });
        } catch (error) {
            console.warn(`Could not scrape ${input.courseUrl}:`, error);
            // Continue without web content if scraping fails
        }
    }

    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const { output } = await prompt({
                ...input,
                currentDate: new Date().toISOString().split('T')[0],
                webContent: webContent || 'No additional content available.',
                durationInMonths: input.durationInMonths || 3,
            });
            if (!output) {
                throw new Error('Failed to generate roadmap: No output from AI.');
            }
            return output; // Success
        } catch (error: any) {
            lastError = error;
            if (error.message.includes('503') && attempt < maxRetries - 1) {
                console.warn(`Roadmap generation failed with 503, retrying... (Attempt ${attempt + 1})`);
                await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1))); // Wait longer each retry
            } else {
                 // For non-503 errors or if retries are exhausted, break the loop
                break;
            }
        }
    }
    // If the loop finished without returning, it means all retries failed.
    throw lastError;
  }
);

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
    return generateRoadmapFlow(input);
}
