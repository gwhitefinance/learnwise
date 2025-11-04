

'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import * as z from 'zod';
import * as fs from 'fs';
import { Readable } from 'stream';
import { MediaPart } from 'genkit';

const generateVideoInputSchema = z.object({
  episodeContent: z.string().describe('The text content for this episode to be converted into a short video.'),
});

const generateVideoOutputSchema = z.object({
  videoUrl: z.string().url().describe('The data URI of the generated video.'),
});

async function downloadVideo(video: MediaPart, path: string) {
  const fetch = (await import('node-fetch')).default;
  const videoDownloadResponse = await fetch(
    `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
  );
  if (
    !videoDownloadResponse ||
    videoDownloadResponse.status !== 200 ||
    !videoDownloadResponse.body
  ) {
    throw new Error('Failed to fetch video');
  }

  const buffer = await videoDownloadResponse.buffer();
  return `data:video/mp4;base64,${buffer.toString('base64')}`;
}

const startVideoGenerationFlow = ai.defineFlow(
    {
        name: 'startVideoGenerationFlow',
        inputSchema: generateVideoInputSchema,
        outputSchema: generateVideoOutputSchema,
    },
    async (input) => {
        let { operation } = await ai.generate({
            model: googleAI.model('veo-2.0-generate-001'),
            prompt: `Create a short, 5-second animated video visualizing the key concepts from the following text: ${input.episodeContent}`,
            config: {
                durationSeconds: 5,
            }
        });

        if (!operation) {
            throw new Error('Expected the model to return an operation');
        }

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 20000));
            operation = await ai.checkOperation(operation);
        }

        if (operation.error) {
            throw new Error('Video generation failed: ' + operation.error.message);
        }
        
        const video = operation.output?.message?.content.find((p: any) => !!p.media);

        if (!video || !video.media?.url) {
             throw new Error('No video URL was returned from the operation.');
        }

        const videoDataUri = await downloadVideo(video, 'output.mp4');

        return { videoUrl: videoDataUri };
    }
);

const checkVideoOperation = ai.defineFlow(
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


export async function generateVideo(input: z.infer<typeof generateVideoInputSchema>): Promise<z.infer<typeof generateVideoOutputSchema>> {
    return startVideoGenerationFlow(input);
}

export async function checkVideo(operation: any): Promise<any> {
    return checkVideoOperation(operation);
}
