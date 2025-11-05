
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
  
  const generationPrompt = `You are an AI assistant that creates educational diagrams. Your task is to generate a clear, simple, and professional-looking diagram, infographic, or 3D render that visually explains the following academic concept.

The concept could be from Math, Science, History, Literature, or another subject.

**CRITICAL INSTRUCTIONS**:
1.  **Relevance is Key**: The image MUST directly illustrate the concept provided.
2.  **Educational Focus**: Prioritize clarity and educational value over artistic flair.
3.  **NO CODE**: Do NOT generate images of computer code unless the concept is specifically about programming.
4.  **NO ABSTRACT ART**: Avoid abstract or purely decorative images that do not explain the concept.

Concept to visualize: "${input.prompt}"`;
  
  const { media } = await ai.generate({
    model: googleAI.model('imagen-4.0-fast-generate-001'),
    prompt: generationPrompt,
  });

  if (!media?.url) {
    throw new Error('Failed to generate image.');
  }

  return { imageUrl: media.url };
}
