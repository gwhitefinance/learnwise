
'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { generateVideoInputSchema, generateVideoOutputSchema, type GenerateVideoInput, type GenerateVideoOutput } from '@/ai/schemas/video-schema';
import * as fs from 'fs';
import { Readable } from 'stream';
import type { MediaPart } from 'genkit';


const videoPrompt = ai.definePrompt({
    name: 'videoGenerationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    prompt: `You are an engaging podcast host named "AI Buddy". Your task is to convert the following educational material into a single, conversational, and informative podcast episode script. This script will be used for a short video.

    Course Name: {{courseName}}
    Episode Title: {{episodeTitle}}
    
    Content to transform:
    "{{episodeContent}}"

    Instructions:
    1.  **Introduction**: Start with a catchy intro, introducing yourself, the main course topic, and this specific episode's title.
    2.  **Conversational Tone**: Rewrite the content in a natural, spoken-word format. Use questions, rhetorical devices, and a friendly tone. Avoid just reading the text.
    3.  **Structure**: Break the content down into logical segments. Use transitions to move smoothly between topics.
    4.  **Outro**: End with a brief summary of the episode and a friendly sign-off, perhaps teasing the next topic.
    5.  **Concise**: Keep the script concise, suitable for a 1-2 minute video.
    
    Generate only the script for this single podcast episode.
    `,
});

async function downloadVideo(video: MediaPart, path: string) {
  if (!video.media?.url) {
      throw new Error('Video URL is missing');
  }
  const fetch = (await import('node-fetch')).default;
  const videoDownloadResponse = await fetch(
    `${video.media.url}&key=${process.env.GEMINI_API_KEY}`
  );
  if (
    !videoDownloadResponse ||
    videoDownloadResponse.status !== 200 ||
    !videoDownloadResponse.body
  ) {
    throw new Error('Failed to fetch video');
  }

  const stream = Readable.from(videoDownloadResponse.body);
  const bufs: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    stream.on('data', (d) => bufs.push(d));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(bufs)));
  });
}


const generateVideoFlow = ai.defineFlow(
    {
        name: 'generateVideoFlow',
        inputSchema: generateVideoInputSchema,
        outputSchema: generateVideoOutputSchema,
    },
    async (input) => {
        // 1. Generate the script
        const { text: script } = await videoPrompt(input);
        if (!script) {
            throw new Error('Failed to generate video script.');
        }

        // 2. Generate the video from the script
        let { operation } = await ai.generate({
            model: googleAI.model('veo-2.0-generate-001'),
            prompt: `Create an engaging, educational video about ${input.episodeTitle}. The video should be visually appealing with animated text, diagrams, and stock footage related to these concepts: ${input.episodeContent.substring(0, 500)}`,
            config: {
              durationSeconds: 8,
              aspectRatio: '16:9',
            },
        });

        if (!operation) {
            throw new Error('Expected the model to return an operation');
        }

        // Wait until the operation completes.
        while (!operation.done) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            operation = await ai.checkOperation(operation);
        }

        if (operation.error) {
            throw new Error('failed to generate video: ' + operation.error.message);
        }

        const videoPart = operation.output?.message?.content.find((p) => !!p.media);
        if (!videoPart || !videoPart.media?.url) {
            throw new Error('Failed to find the generated video in the operation output');
        }

        const videoBuffer = await downloadVideo(videoPart, 'output.mp4');
        const videoDataUri = `data:${videoPart.media.contentType || 'video/mp4'};base64,${videoBuffer.toString('base64')}`;

        return { 
            script,
            videoUrl: videoDataUri,
        };
    }
);

export async function generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput> {
    return generateVideoFlow(input);
}
