
'use server';
/**
 * @fileOverview An AI flow for creating a comprehensive study guide from various sources.
 */
import { ai, googleAI } from '@/ai/genkit';
import { z } from 'zod';
import { scrapeWebpageTool } from '@/ai/tools/web-scraper-tool';
import { getYouTubeTranscript } from '@/ai/tools/youtube-transcript-tool';
import { CrunchTimeInputSchema, CrunchTimeOutputSchema, CrunchTimeInput, CrunchTimeOutput } from '@/ai/schemas/crunch-time-schema';


const prompt = ai.definePrompt({
    name: 'crunchTimePrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: CrunchTimeInputSchema },
    output: { schema: CrunchTimeOutputSchema },
    prompt: `You are an expert AI tutor named Tutorin. Your task is to take provided study material and generate a complete, high-impact study guide for a student in "crunch time".

    The user's learning style is: {{learnerType}}. You MUST tailor your output, especially the Study Plan, to this style.

    **CRITICAL**: For any mathematical expressions, especially exponents and fractions, use proper notation. For example, use 'x²' instead of 'x^2', and use Unicode characters like '½' for fractions instead of '1/2'.

    Study Material ({{inputType}}):
    {{#if imageDataUri}}
    {{media url=imageDataUri}}
    {{else}}
    "{{content}}"
    {{/if}}

    **Instructions**:

    1.  **Title**: Generate a short, descriptive title for this study session based on the content.
    2.  **Key Concepts**: Identify the 3-5 most critical vocabulary terms or concepts. Provide a concise definition for each.
    3.  **Summary**: Write a 2-4 sentence summary that captures the absolute core information a student must know.
    4.  **Practice Quiz**: Create a small quiz with exactly 3 multiple-choice questions. These questions should test the main ideas, not obscure details. For each question, provide 4 options and the correct answer.
    5.  **Study Plan**: Devise a 3-step, actionable study plan tailored to the user's learning style.
        -   **Visual**: Suggest creating diagrams, color-coding notes, or watching a specific type of video.
        -   **Auditory**: Suggest explaining the concepts out loud, creating a mnemonic device, or finding a related podcast.
        -   **Kinesthetic**: Suggest a hands-on activity, a real-world application, or a way to physically interact with the concept.
        -   **Reading/Writing**: Suggest re-summarizing, outlining the key points, or writing out definitions by hand.

    Generate the complete study guide.
    `,
});

const crunchTimeFlow = ai.defineFlow(
  {
    name: 'crunchTimeFlow',
    inputSchema: CrunchTimeInputSchema,
    outputSchema: CrunchTimeOutputSchema,
  },
  async (input) => {
    let processedContent = input.content;
    let imageDataUri: string | undefined = undefined;

    if (input.inputType === 'url') {
      try {
        if (input.content.includes('youtube.com') || input.content.includes('youtu.be')) {
          processedContent = await getYouTubeTranscript({ url: input.content });
        } else {
          processedContent = await scrapeWebpageTool({ url: input.content });
        }
        if (processedContent.startsWith('Error:')) {
          throw new Error(processedContent);
        }
      } catch (error) {
        console.error("Failed to process URL:", error);
        throw new Error("Could not retrieve content from the provided URL. Please check the link and try again.");
      }
    } else if (input.inputType === 'image') {
        imageDataUri = input.content;
        processedContent = ''; // Content is in the image
    }

    const { output } = await prompt({
        ...input,
        content: processedContent,
        imageDataUri: imageDataUri,
    });

    if (!output) {
        throw new Error('Failed to generate a study guide.');
    }
    return output;
  }
);

export async function generateCrunchTimeStudyGuide(input: CrunchTimeInput): Promise<CrunchTimeOutput> {
    return crunchTimeFlow(input);
}
