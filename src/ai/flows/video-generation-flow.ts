
'use server';
/**
 * @fileOverview A flow for generating videos from text prompts.
 */
import { ai, googleAI } from '@/ai/genkit';
import { GenerateVideoInput, GenerateVideoInputSchema, GenerateVideoOutput, GenerateVideoOutputSchema } from '@/ai/schemas/video-generation-schema';
import { MediaPart } from 'genkit';
import { Readable } from 'stream';
import * as fs from 'fs';


async function downloadVideoAsDataURI(video: MediaPart): Promise<string> {
  const fetch = (await import('node-fetch')).default;
  
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Cannot download video.');
    return '';
  }

  const videoDownloadUrl = `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`;
  const videoDownloadResponse = await fetch(videoDownloadUrl);

  if (!videoDownloadResponse || videoDownloadResponse.status !== 200 || !videoDownloadResponse.body) {
    throw new Error('Failed to fetch video');
  }

  const videoBuffer = await videoDownloadResponse.arrayBuffer();
  const base64String = Buffer.from(videoBuffer).toString('base64');
  const contentType = videoDownloadResponse.headers.get('content-type') || 'video/mp4';

  return `data:${contentType};base64,${base64String}`;
}

const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async ({ prompt }) => {
    try {
        let { operation } = await ai.generate({
            model: googleAI.model('veo-2.0-generate-001'),
            prompt: prompt,
            config: {
                durationSeconds: 5,
                aspectRatio: '16:9',
            },
        });

        if (!operation) {
            throw new Error('Expected the model to return an operation');
        }

        // Wait until the operation completes.
        while (!operation.done) {
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Check every 5 seconds
            operation = await ai.checkOperation(operation);
        }

        if (operation.error) {
            throw new Error('Failed to generate video: ' + operation.error.message);
        }

        const video = operation.output?.message?.content.find((p) => !!p.media);
        if (!video) {
            throw new Error('Failed to find the generated video in the operation output');
        }
        
        const dataUri = await downloadVideoAsDataURI(video);

        return { media: dataUri };
    
    } catch (error) {
        console.error("Video generation error:", error);
        // Return an empty string if generation fails to avoid breaking the entire module flow
        return { media: '' };
    }
  }
);


export async function generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput> {
    return generateVideoFlow(input);
}
