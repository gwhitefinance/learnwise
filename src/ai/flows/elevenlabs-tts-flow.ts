
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { streamToBuffer } from '@/lib/stream-utils';

const ElevenLabsInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type ElevenLabsInput = z.infer<typeof ElevenLabsInputSchema>;

const ElevenLabsOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a data URI.'),
});
export type ElevenLabsOutput = z.infer<typeof ElevenLabsOutputSchema>;

const elevenlabsClient = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
});

const generateElevenLabsAudioFlow = ai.defineFlow(
  {
    name: 'generateElevenLabsAudioFlow',
    inputSchema: ElevenLabsInputSchema,
    outputSchema: ElevenLabsOutputSchema,
  },
  async ({ text }) => {
    try {
        const audioStream = await elevenlabsClient.textToSpeech.generate({
            voice: 'Rachel',
            text,
            model_id: 'eleven_multilingual_v2',
        });

        // The JS SDK returns a browser ReadableStream. We need to handle it.
        const reader = audioStream.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }
        
        const audioBuffer = Buffer.concat(chunks);
        const base64Audio = audioBuffer.toString('base64');
        
        return {
            audioDataUri: `data:audio/mpeg;base64,${base64Audio}`,
        };

    } catch (error) {
        console.error("ElevenLabs API error:", error);
        throw new Error("Failed to generate audio from ElevenLabs.");
    }
  }
);

export async function generateElevenLabsAudio(input: ElevenLabsInput): Promise<ElevenLabsOutput> {
    return generateElevenLabsAudioFlow(input);
}
