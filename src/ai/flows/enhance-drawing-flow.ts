'use server';
/**
 * @fileOverview An AI flow to enhance and beautify user drawings from a whiteboard.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import {
  EnhanceDrawingInputSchema,
  EnhanceDrawingOutputSchema,
  EnhanceDrawingInput,
  EnhanceDrawingOutput,
} from '@/ai/schemas/enhance-drawing-schema';

const enhanceDrawingPrompt = ai.definePrompt({
  name: 'enhanceDrawingPrompt',
  model: googleAI.model('gemini-2.5-flash-image-preview'),
  input: { schema: EnhanceDrawingInputSchema },
  /**
   * FIX 1: Define the prompt structure here using the 'messages' property.
   * This function receives the 'input' and constructs the prompt.
   */
  messages: (input) => [
    {
      role: 'user',
      content: [
        { media: { url: input.imageDataUri, contentType: 'image/png' } },
        {
          text: 'Enhance this drawing. Make the lines cleaner, the shapes more defined, and the text more legible. Do not add new elements. Respond only with the improved image on a transparent background.',
        },
      ],
    },
  ],
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

const enhanceDrawingFlow = ai.defineFlow(
  {
    name: 'enhanceDrawingFlow',
    inputSchema: EnhanceDrawingInputSchema,
    outputSchema: EnhanceDrawingOutputSchema,
  },
  async (input) => {
    /**
     * FIX 2: Simply call the defined prompt with the 'input'.
     * Genkit will automatically use the 'messages' function you defined above.
     */
    const { media } = await enhanceDrawingPrompt(input);

    if (!media || !media.url) {
      throw new Error('Failed to generate enhanced image.');
    }

    return { enhancedImageDataUri: media.url };
  }
);

export async function enhanceDrawing(
  input: EnhanceDrawingInput
): Promise<EnhanceDrawingOutput> {
  return enhanceDrawingFlow(input);
}