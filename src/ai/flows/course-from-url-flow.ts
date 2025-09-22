
'use server';
/**
 * @fileOverview A flow for generating a structured mini-course from a URL.
 *
 * - generateCourseFromUrl - A function that scrapes a URL and generates a course with modules and chapters.
 */
import { ai } from '@/ai/genkit';
import { scrapeWebpageTool } from '@/ai/tools/web-scraper-tool';
import { GenerateCourseFromUrlInput, GenerateCourseFromUrlInputSchema, GenerateCourseFromUrlOutput, GenerateCourseFromUrlOutputSchema } from '@/ai/schemas/course-from-url-schema';

const prompt = ai.definePrompt({
    name: 'courseFromUrlPrompt',
    input: { schema: GenerateCourseFromUrlInputSchema },
    output: { schema: GenerateCourseFromUrlOutputSchema },
    tools: [scrapeWebpageTool],
    prompt: `You are an expert instructional designer. Your task is to create a detailed, multi-module mini-course based on the content scraped from a webpage.

    Webpage Content:
    "{{webContent}}"
    
    Instructions:
    1.  **Analyze Content**: Read through the provided webpage content and identify the main topics, concepts, and structure.
    2.  **Extract Course Title**: Determine a suitable and concise title for the course based on the content.
    3.  **Create Modules**: Group the content into 3-5 logical modules. Each module should represent a major section or theme of the source material. Give each module a clear title.
    4.  **Develop Chapters**: For each module, break down the information into 3-4 detailed chapters. Each chapter should cover a specific sub-topic and include comprehensive educational content derived from the source text.
    5.  **Tailor Content**: The user is a {{learnerType}} learner. Adapt the content and activities for each chapter accordingly:
        -   **Visual**: Use descriptive language and analogies. Suggest creating diagrams or mind maps.
        -   **Auditory**: Write in a conversational, step-by-step manner. Suggest explaining concepts aloud.
        -   **Kinesthetic**: Include hands-on activities, real-world examples, or simple practical exercises.
        -   **Reading/Writing**: Provide clear, well-structured text and suggest summarizing or outlining.
    6.  **Create Activities**: For each chapter, devise a simple, interactive activity that reinforces the chapter's content and is tailored to the learner's style.

    Generate the complete course structure with a course title, modules, and for each module, a list of chapters containing detailed content and a relevant activity.
    `,
});

const generateCourseFromUrlFlow = ai.defineFlow(
  {
    name: 'generateCourseFromUrlFlow',
    inputSchema: GenerateCourseFromUrlInputSchema,
    outputSchema: GenerateCourseFromUrlOutputSchema,
  },
  async (input) => {
    
    let webContent = '';
    if (input.courseUrl && input.courseUrl.trim() !== '') {
        try {
            webContent = await scrapeWebpageTool({ url: input.courseUrl });
        } catch (error) {
            console.warn(`Could not scrape ${input.courseUrl}:`, error);
            throw new Error(`Failed to retrieve content from the provided URL. Please check the link and try again.`);
        }
    } else {
        throw new Error('A valid course URL is required.');
    }

    const { output } = await prompt({
        ...input,
        webContent: webContent,
    });
    
    if (!output) {
        throw new Error('Failed to generate course from URL.');
    }
    return output;
  }
);

export async function generateCourseFromUrl(input: GenerateCourseFromUrlInput): Promise<GenerateCourseFromUrlOutput> {
    return generateCourseFromUrlFlow(input);
}
