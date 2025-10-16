
'use server';
/**
 * @fileoverview A flow for converting text to speech using ElevenLabs.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ElevenLabsClient } from 'elevenlabs-node';
import { PassThrough } from 'stream';

const ElevenLabsInputSchema = z.object({
  text: z.string().describe('The text content to convert to speech.'),
});
type ElevenLabsInput = z.infer<typeof ElevenLabsInputSchema>;

const ElevenLabsOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a data URI.'),
});
type ElevenLabsOutput = z.infer<typeof ElevenLabsOutputSchema>;

async function streamToBuffer(stream: PassThrough): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks);
}


const generateElevenLabsAudioFlow = ai.defineFlow(
  {
    name: 'generateElevenLabsAudioFlow',
    inputSchema: ElevenLabsInputSchema,
    outputSchema: ElevenLabsOutputSchema,
  },
  async ({ text }) => {
    if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error('ElevenLabs API key is not configured.');
    }

    const elevenlabs = new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY,
    });

    try {
        const audioStream = await elevenlabs.generate({
            voice: 'Rachel', // A good default voice
            text,
            model_id: 'eleven_multilingual_v2',
        });
        
        const audioBuffer = await streamToBuffer(audioStream as PassThrough);
        
        const audioBase64 = audioBuffer.toString('base64');

        return {
            audioDataUri: `data:audio/mpeg;base64,${audioBase64}`,
        };

    } catch (error) {
        console.error("ElevenLabs TTS error:", error);
        throw new Error("Failed to generate audio from ElevenLabs.");
    }
  }
);


export async function generateElevenLabsAudio(input: ElevenLabsInput): Promise<ElevenLabsOutput> {
    return generateElevenLabsAudioFlow(input);
}
