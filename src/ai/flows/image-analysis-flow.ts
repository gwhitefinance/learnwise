
'use server';
/**
 * @fileOverview A flow for analyzing and summarizing content from an image.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { AnalyzeImageInput, AnalyzeImageInputSchema, AnalyzeImageOutput, AnalyzeImageOutputSchema } from '@/ai/schemas/image-analysis-schema';

const analysisPrompt = ai.definePrompt({
    name: 'imageAnalysisPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: AnalyzeImageInputSchema },
    output: { schema: AnalyzeImageOutputSchema },
    prompt: `You are an expert AI assistant who solves academic problems for students from an image.
    Analyze the provided image. Identify every distinct problem or question present.
    For each problem you find, provide a detailed, step-by-step solution and a final, conclusive answer.
    
    **CRITICAL INSTRUCTIONS**:
    1.  **Identify All Problems**: Find every single question in the image, even if there are multiple.
    2.  **Solve Each One**: For each identified problem, generate a clear, step-by-step solution.
    3.  **Provide Final Answers**: After the steps for each problem, state the final answer clearly.
    4.  **Mathematical Notation**: For ALL mathematical expressions, especially exponents and fractions, use proper notation. For example, use 'x²' instead of 'x^2', and use Unicode characters like '½' for fractions instead of '1/2'.
    5.  **Return All Solutions**: Your final output must be an array of all the solutions you've generated.

    User's Question/Prompt (use this for context if provided): {{#if prompt}}{{prompt}}{{else}}No specific prompt provided.{{/if}}
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
