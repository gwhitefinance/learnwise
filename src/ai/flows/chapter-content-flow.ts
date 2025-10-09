
'use server';
/**
 * @fileOverview A flow for generating detailed content for a single course chapter, including prompts for multimedia.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { GenerateChapterContentInput, GenerateChapterContentInputSchema, GenerateChapterContentOutput, GenerateChapterContentOutputSchema } from '@/ai/schemas/chapter-content-schema';

const prompt = ai.definePrompt({
    name: 'generateChapterContentPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GenerateChapterContentInputSchema },
    output: { schema: GenerateChapterContentOutputSchema },
    prompt: `You are an expert instructional designer and multimedia producer who creates engaging, comprehensive, and in-depth educational content.

    Your task is to write the content for a single chapter and devise relevant multimedia prompts.

    Course Context:
    - Course Name: {{courseName}}
    - Module: {{moduleTitle}}
    - Chapter: {{chapterTitle}}

    **CRITICAL INSTRUCTION**: Your primary goal is to generate the 'content' for this chapter. The content MUST be the length of a detailed essay, comprising at least 5 to 7 substantial paragraphs. It must be a comprehensive, word-heavy educational resource. Do NOT provide a short summary.

    The user is a {{learnerType}} learner. Tailor the content and the interactive activity accordingly:
    - For Visual learners, the content should be very descriptive, using metaphors and analogies to paint a picture. The activity should involve creating diagrams, mind maps, or analyzing visual media.
    - For Auditory learners, write the content in a conversational, script-like format. The activity could involve listening to a relevant podcast, or explaining the concept aloud.
    - For Kinesthetic learners, the activity must be hands-on and interactive. Suggest building a model, performing a practical exercise, or relating the topic to a physical task.
    - For Reading/Writing learners, provide clear, well-structured text-based explanations and suggest activities like writing summaries or creating outlines.

    **MULTIMEDIA GENERATION:**
    After generating the content and activity, create prompts for generative AI models:
    1.  **Image Prompt**: Write a concise, descriptive prompt (10-15 words) for a text-to-image model to create a visually appealing header image for this chapter.
    2.  **Diagram Prompt**: Write a detailed prompt for a text-to-image model to generate an educational diagram, chart, or infographic that visually explains a core concept from the chapter. Be specific about labels, arrows, and components.
    3.  **Video Prompt**: Write a descriptive prompt for a text-to-video model to generate a short, 5-8 second silent educational video clip. Describe the scene, action, and style (e.g., "A cinematic, slow-motion shot of...", "An animated, time-lapse video showing...").

    First, generate the detailed 'content'.
    Second, devise a creative and tailored 'activity'.
    Third, create the 'imagePrompt', 'diagramPrompt', and 'videoPrompt'.
    `,
});


const generateChapterContentFlow = ai.defineFlow(
  {
    name: 'generateChapterContentFlow',
    inputSchema: GenerateChapterContentInputSchema,
    outputSchema: GenerateChapterContentOutputSchema,
  },
  async (input) => {
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const { output } = await prompt(input);
            if (!output) {
                throw new Error('Failed to generate chapter content: No output from AI.');
            }
            return output; // Success
        } catch (error: any) {
            lastError = error;
            if (error.message.includes('503') && attempt < maxRetries - 1) {
                console.warn(`Chapter content generation failed with 503, retrying... (Attempt ${attempt + 1})`);
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

export async function generateChapterContent(input: GenerateChapterContentInput): Promise<GenerateChapterContentOutput> {
    return generateChapterContentFlow(input);
}
