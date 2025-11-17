
'use server';
/**
 * @fileOverview A flow for generating a course from a collection of materials.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { scrapeWebpageTool } from '@/ai/tools/web-scraper-tool';
import { getYouTubeTranscript } from '@/ai/tools/youtube-transcript-tool';
import { GenerateMiniCourseOutputSchema } from '@/ai/schemas/mini-course-schema';

export const GenerateCourseFromMaterialsInputSchema = z.object({
  courseName: z.string().describe("The desired name for the new course."),
  textContext: z.string().optional().describe("A collection of raw text snippets."),
  urls: z.array(z.string().url()).optional().describe("A list of URLs to scrape for content."),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateCourseFromMaterialsInput = z.infer<typeof GenerateCourseFromMaterialsInputSchema>;

const prompt = ai.definePrompt({
    name: 'courseFromMaterialsPrompt',
    model: googleAI.model('gemini-2.5-pro'),
    output: { schema: GenerateMiniCourseOutputSchema },
    prompt: `You are an expert instructional designer. Your task is to synthesize various pieces of content into a single, cohesive mini-course outline.

    **Course Name**: {{courseName}}
    
    **Provided Content**:
    '''
    {{#if combinedContent}}
    {{combinedContent}}
    {{else}}
    No text content provided. Generate a standard course based on the title.
    {{/if}}
    '''

    **CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:**
    1.  **Analyze and Synthesize**: Read all the provided content and identify the main themes, topics, and sub-topics.
    2.  **Generate Structure**: Create a logical course structure with 7-10 modules. Each module should represent a major topic discovered in the content.
    3.  **Create Chapters**: For EACH module, create 5-7 relevant chapter titles that break down the module's topic.
    4.  **Add Quizzes**: Add a "Module Quiz" chapter at the end of EACH module's chapter list.
    5.  **Titles Only**: DO NOT generate the chapter content, descriptions, or activities. Your ONLY job is to create the course title, module titles, and chapter titles based on the synthesized content.
    `,
});

export const generateCourseFromMaterialsFlow = ai.defineFlow(
  {
    name: 'generateCourseFromMaterialsFlow',
    inputSchema: GenerateCourseFromMaterialsInputSchema,
    outputSchema: GenerateMiniCourseOutputSchema,
  },
  async (input) => {
    let combinedContent = input.textContext || '';

    if (input.urls && input.urls.length > 0) {
        const urlContents = await Promise.all(
            input.urls.map(async (url) => {
                try {
                    if (url.includes('youtube.com') || url.includes('youtu.be')) {
                        return await getYouTubeTranscript({ url });
                    } else {
                        return await scrapeWebpageTool({ url });
                    }
                } catch (error) {
                    console.warn(`Could not process URL ${url}:`, error);
                    return ``; // Return empty string on failure
                }
            })
        );
        combinedContent += '\n\n' + urlContents.filter(Boolean).join('\n\n---\n\n');
    }

    const { output } = await prompt({
        courseName: input.courseName,
        combinedContent: combinedContent.trim(),
    });
    
    if (!output) {
        throw new Error('Failed to generate course from materials.');
    }
    return output;
  }
);

export async function generateCourseFromMaterials(input: GenerateCourseFromMaterialsInput) {
    return generateCourseFromMaterialsFlow(input);
}
