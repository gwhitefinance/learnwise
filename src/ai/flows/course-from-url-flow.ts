
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
    prompt: `You are an expert instructional designer tasked with converting a webpage into a structured mini-course.

    Primary Course Information:
    - Course Name: {{courseName}}
    {{#if courseDescription}}
    - Course Description: {{courseDescription}}
    {{/if}}

    Additional Content (from a URL):
    "{{webContent}}"
    
    Instructions:
    1.  **Analyze Content**: First, determine if the "Additional Content" is relevant to the "Primary Course Information". If it seems like a generic login page, marketing page, or is otherwise irrelevant, IGNORE it.
    2.  **Generate Course**:
        -   If the "Additional Content" is relevant, use it as the primary source to create the course.
        -   If the "Additional Content" is irrelevant or empty, generate a high-quality, comprehensive course based ONLY on the "Course Name" and "Course Description".
    3.  **Structure**: Your main goal is to accurately reflect the structure of the provided "Additional Content". Identify the main sections or headings on the page and treat them as modules. Identify the sub-sections within each main section and treat them as chapters. Generate as many modules and chapters as are present in the source content. DO NOT limit yourself to a specific number. The titles of modules MUST be extracted directly from the text of the 'Additional Content' and must be exact matches. Prepend "Unit X:" to each module title, where X is the module number (e.g., "Unit 1: Introduction", "Unit 2: Core Concepts").
    4.  **Tailor Content**: The user is a {{learnerType}} learner. Adapt the content and activities for each chapter accordingly:
        -   **Visual**: Use descriptive language and analogies. Suggest creating diagrams or mind maps.
        -   **Auditory**: Write in a conversational, step-by-step manner. Suggest explaining concepts aloud.
        -   **Kinesthetic**: Include hands-on activities, real-world examples, or simple practical exercises.
        -   **Reading/Writing**: Provide clear, well-structured text and suggest summarizing or outlining.
    5.  **Create Activities**: For each chapter, devise a simple, interactive activity that reinforces the chapter's content and is tailored to the learner's style.

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
            webContent = 'Scraping failed. Please generate content based on the course title and description.';
        }
    } else {
        webContent = 'No URL provided. Please generate content based on the course title and description.';
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
