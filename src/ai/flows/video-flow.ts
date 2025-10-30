
'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { generateVideoInputSchema } from '@/ai/schemas/video-schema';
import * as z from 'zod';

const generateVideoFlow = ai.defineFlow(
    {
        name: 'generateVideoFlow',
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

export const startVideoGeneration = ai.defineFlow(
  {
    name: 'startVideoGeneration',
    inputSchema: generateVideoInputSchema,
    outputSchema: z.any(),
  },
  async (input) => {
    // Use ai.run() to start the flow without waiting for it to complete.
    // This returns immediately with the operation name.
    const operation = await ai.run(generateVideoFlow, input);
    return operation;
  }
);
