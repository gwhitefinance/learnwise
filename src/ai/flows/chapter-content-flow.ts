
'use server';
/**
 * @fileOverview A flow for generating detailed content for a single course chapter.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateChapterContentInput, GenerateChapterContentInputSchema, GenerateChapterContentOutput, GenerateChapterContentOutputSchema } from '@/ai/schemas/chapter-content-schema';

const prompt = ai.definePrompt({
    name: 'generateChapterContentPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GenerateChapterContentInputSchema },
    output: { schema: GenerateChapterContentOutputSchema },
    prompt: `You are an expert instructional designer who creates engaging, comprehensive, and in-depth educational content.

    Your task is to write the content for a single chapter and devise a relevant interactive activity.

    Course Context:
    - Course Name: {{courseName}}
    - Module: {{moduleTitle}}
    - Chapter: {{chapterTitle}}

    **CRITICAL INSTRUCTION**: Your primary goal is to generate the 'content' for this chapter. The content MUST be the length of a detailed essay, comprising at least 5 to 7 substantial paragraphs. It must be a comprehensive, word-heavy educational resource. Do NOT provide a short summary.

    The user is a {{learnerType}} learner. Tailor the content and the interactive activity accordingly.
    
    **Activity Instruction**: The 'activity' you generate MUST be short, fun, and simple (1-2 sentences). It should be a small, engaging task that helps reinforce the chapter's main point.
    - For Visual learners: Suggest creating a quick sketch, a simple diagram, or finding a relevant image online.
    - For Auditory learners: Suggest a quick vocal exercise, like explaining the concept to a friend or a rubber duck in 30 seconds.
    - For Kinesthetic learners: Suggest a simple, tangible action, like a hand gesture to remember a process or relating the topic to a physical object on their desk.
    - For Reading/Writing learners: Suggest summarizing the main point in one sentence or writing down 3 keywords.

    First, generate the detailed 'content'.
    Second, devise a short and fun 'activity'.
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
            console.warn(`Chapter content generation failed (Attempt ${attempt + 1}/${maxRetries}):`, error.message);
            if (attempt < maxRetries - 1) {
                const waitTime = 2000 * (attempt + 1); // Wait longer each retry
                console.log(`Retrying in ${waitTime / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    // If the loop finished without returning, it means all retries failed.
    console.error("Chapter content generation failed after all retries.", { input, lastError });
    throw lastError;
  }
);

export async function generateChapterContent(input: GenerateChapterContentInput): Promise<GenerateChapterContentOutput> {
    return generateChapterContentFlow(input);
}
