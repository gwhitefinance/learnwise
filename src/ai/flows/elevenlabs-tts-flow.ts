'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ElevenLabsClient } from 'elevenlabs-node';
import { streamToBuffer } from '@/lib/stream-utils';

const ElevenLabsInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type ElevenLabsInput = z.infer<typeof ElevenLabsInputSchema>;

const ElevenLabsOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a data URI.'),
});
export type ElevenLabsOutput = z.infer<typeof ElevenLabsOutputSchema>;

const elevenlabs = new ElevenLabsClient({
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
        const audioStream = await elevenlabs.generate({
            voice: 'Rachel',
            text,
            model_id: 'eleven_multilingual_v2',
        });

        const audioBuffer = await streamToBuffer(audioStream);
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
