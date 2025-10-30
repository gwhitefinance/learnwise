
'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { generateVideoInputSchema } from '@/ai/schemas/video-schema';
import * as z from 'zod';


const generateVideoFlow = ai.defineFlow(
    {
        name: 'generateVideoFlow',
        inputSchema: generateVideoInputSchema,
        outputSchema: z.object({ operation: z.any() }),
    },
    async (input) => {
        // Immediately start the video generation process without creating a script first.
        // This makes the initial request much faster to prevent timeouts.
        const { operation } = await ai.generate({
            model: googleAI.model('veo-3.0-generate-preview'),
            prompt: `Create a short, 5-second animated video visualizing the key concepts from the following text: ${input.episodeContent}`,
        });

        if (!operation) {
            throw new Error('Expected the model to return an operation');
        }
        
        return { operation };
    }
);

export default generateVideoFlow;
