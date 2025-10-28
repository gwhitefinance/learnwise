
'use server';
/**
 * @fileOverview An AI flow to enhance and beautify user drawings from a whiteboard.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { EnhanceDrawingInputSchema, EnhanceDrawingOutputSchema, EnhanceDrawingInput, EnhanceDrawingOutput } from '@/ai/schemas/enhance-drawing-schema';

const enhanceDrawingPrompt = ai.definePrompt({
    name: 'enhanceDrawingPrompt',
    model: googleAI.model('gemini-2.5-flash-image-preview'),
    input: { schema: EnhanceDrawingInputSchema },
    output: { schema: EnhanceDrawingOutputSchema },
    config: {
        responseModalities: ['TEXT', 'IMAGE'],
    },
    prompt: [
        { media: { url: '{{imageDataUri}}' } },
        { text: 'You are a graphic design assistant. Redraw the provided rough sketch, diagram, or handwriting to be clearer, more polished, and visually appealing. Maintain the original layout and all core concepts, but improve the line quality, straighten shapes, and make text more legible. Respond only with the enhanced drawing. Do not add any elements that were not in the original sketch.' },
    ],
});

const enhanceDrawingFlow = ai.defineFlow(
  {
    name: 'enhanceDrawingFlow',
    inputSchema: EnhanceDrawingInputSchema,
    outputSchema: EnhanceDrawingOutputSchema,
  },
  async (input) => {
    const { media } = await enhanceDrawingPrompt(input);
    
    if (!media || !media.url) {
        throw new Error('Failed to generate enhanced image.');
    }

    return { enhancedImageDataUri: media.url };
  }
);


export async function enhanceDrawing(input: EnhanceDrawingInput): Promise<EnhanceDrawingOutput> {
    return enhanceDrawingFlow(input);
}
