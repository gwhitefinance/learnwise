
'use server';
/**
 * @fileOverview A flow for generating detailed content for a single course chapter.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateChapterContentInputSchema = z.object({
  courseName: z.string().describe('The name of the overall course.'),
  moduleTitle: z.string().describe('The title of the module this chapter belongs to.'),
  chapterTitle: z.string().describe('The title of the chapter to generate content for.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});

const GenerateChapterContentOutputSchema = z.object({
  content: z.string().describe('The detailed, essay-length educational content for the chapter.'),
  activity: z.string().describe('A suggested, interactive activity based on the chapter content, tailored to the learner\'s style.'),
});

export type GenerateChapterContentInput = z.infer<typeof GenerateChapterContentInputSchema>;
export type GenerateChapterContentOutput = z.infer<typeof GenerateChapterContentOutputSchema>;


const prompt = ai.definePrompt({
    name: 'generateChapterContentPrompt',
    model: 'googleai/gemini-1.5-flash',
    input: { schema: GenerateChapterContentInputSchema },
    output: { schema: GenerateChapterContentOutputSchema },
    prompt: `You are an expert instructional designer who writes engaging, comprehensive, and in-depth educational content.

    Your task is to write the content for a single chapter within a course.

    Course Context:
    - Course Name: {{courseName}}
    - Module: {{moduleTitle}}
    - Chapter: {{chapterTitle}}

    **CRITICAL INSTRUCTION**: Your primary goal is to generate the 'content' for this chapter. The content MUST be the length of a detailed essay, comprising at least 5 to 7 substantial paragraphs. It must be a comprehensive, word-heavy educational resource. Do NOT provide a short summary.

    The user is a {{learnerType}} learner. Tailor the content and the interactive activity accordingly:
    - For Visual learners, the content should be very descriptive, using metaphors and analogies to paint a picture. The activity should involve creating diagrams, mind maps, or analyzing visual media.
    - For Auditory learners, write the content in a conversational, script-like format. The activity could involve listening to a relevant podcast, or explaining the concept aloud.
    - For Kinesthetic learners, the activity must be hands-on and interactive. Suggest building a model, performing a practical exercise, or relating the topic to a physical task.
    - For Reading/Writing learners, provide clear, well-structured, text-based explanations and suggest activities like writing summaries or creating outlines.

    First, generate the detailed 'content'.
    Second, devise a creative and tailored 'activity' that reinforces the chapter's content.
    `,
});


const generateChapterContentFlow = ai.defineFlow(
  {
    name: 'generateChapterContentFlow',
    inputSchema: GenerateChapterContentInputSchema,
    outputSchema: GenerateChapterContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate chapter content.');
    }
    return output;
  }
);

export async function generateChapterContent(input: GenerateChapterContentInput): Promise<GenerateChapterContentOutput> {
    return generateChapterContentFlow(input);
}
