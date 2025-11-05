
'use server';
/**
 * @fileOverview A flow for generating an image from a text prompt.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A descriptive prompt for the image to be generated.'),
});

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The generated image as a base64 encoded data URI.'),
});

export async function generateImage(input: z.infer<typeof GenerateImageInputSchema>): Promise<z.infer<typeof GenerateImageOutputSchema>> {
  
  const generationPrompt = `Generate a clear, simple, and professional-looking diagram, infographic, or 3D render that visually explains the following concept. The image should be clean, modern, and suitable for educational material.

Concept: "${input.prompt}"`;
  
  const { media } = await ai.generate({
    model: googleAI.model('imagen-4.0-fast-generate-001'),
    prompt: generationPrompt,
  });

  if (!media?.url) {
    throw new Error('Failed to generate image.');
  }

  return { imageUrl: media.url };
}
