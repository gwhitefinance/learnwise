
'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import * as z from 'zod';

// Input schema is just the text content of the chapter
const generateVideoInputSchema = z.object({
  episodeContent: z.string().describe('The text content for this episode to be converted into a short video.'),
});


export const startVideoGenerationFlow = ai.defineFlow(
    {
        name: 'startVideoGenerationFlow',
        inputSchema: generateVideoInputSchema,
        outputSchema: z.any(),
    },
    async (input) => {
        const { operation } = await ai.generate({
            model: googleAI.model('veo-3.0-generate-preview'),
            prompt: `Create a short, 5-second animated video visualizing the key concepts from the following text: ${input.episodeContent}`,
        });

        if (!operation) {
            throw new Error('Expected the model to return an operation');
        }

        return operation;
    }
);

export const checkVideoOperation = ai.defineFlow(
  {
    name: 'checkVideoOperation',
    inputSchema: z.any(),
    outputSchema: z.any(),
  },
  async (operation) => {
    const result = await ai.checkOperation(operation);
    return result;
  }
);
