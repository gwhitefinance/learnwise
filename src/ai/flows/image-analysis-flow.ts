
'use server';
/**
 * @fileOverview A flow for analyzing and summarizing content from an image.
 */
import { ai, googleAI } from '@/ai/genkit';
import { AnalyzeImageInput, AnalyzeImageInputSchema, AnalyzeImageOutput, AnalyzeImageOutputSchema } from '@/ai/schemas/image-analysis-schema';

const analysisPrompt = ai.definePrompt({
    name: 'imageAnalysisPrompt',
    model: googleAI.model('gemini-pro-vision'),
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
