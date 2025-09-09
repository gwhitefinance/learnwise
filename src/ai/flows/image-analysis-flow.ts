
'use server';
/**
 * @fileOverview A flow for analyzing and summarizing content from an image.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const AnalyzeImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().optional().describe('An optional prompt or question about the image.'),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;


export const AnalyzeImageOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis or summary of the image content.'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

const analysisPrompt = ai.definePrompt({
    name: 'imageAnalysisPrompt',
    input: { schema: AnalyzeImageInputSchema },
    output: { schema: AnalyzeImageOutputSchema },
    prompt: `You are an expert AI assistant who analyzes images for students.
    Analyze the provided image.
    - If the image contains text (like a screenshot of a document or slide), extract the key points and provide a concise summary.
    - If the image contains a diagram or chart, explain what it represents and how its components are related.
    - If the user provides a specific prompt or question, focus your analysis on answering that.

    User's Question/Prompt: {{#if prompt}}{{prompt}}{{else}}No specific prompt provided.{{/if}}
    Image for analysis: {{media url=imageDataUri}}`,
});


const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    if (!output) {
        throw new Error('Failed to analyze image.');
    }
    return output;
  }
);

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
    return analyzeImageFlow(input);
}
