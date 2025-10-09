
'use server';
/**
 * @fileOverview A flow for generating images from text prompts.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { GenerateImageInput, GenerateImageInputSchema, GenerateImageOutput, GenerateImageOutputSchema } from '@/ai/schemas/image-generation-schema';

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({ prompt }) => {
    try {
        const { media } = await ai.generate({
            model: googleAI.model('imagen-4.0-fast-generate-001'),
            prompt: prompt,
        });

        if (!media) {
            throw new Error('Image generation failed to return media.');
        }

        return { media: media.url };

    } catch (error) {
        console.error("Image generation error:", error);
        // Return an empty string if generation fails to avoid breaking the entire module flow
        return { media: '' };
    }
  }
);

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
    return generateImageFlow(input);
}
