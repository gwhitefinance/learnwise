
'use server';
/**
 * @fileOverview A flow for converting text to speech.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import wav from 'wav';
import { TextToSpeechInputSchema, TextToSpeechOutputSchema, TextToSpeechInput, TextToSpeechOutput } from '@/ai/schemas/text-to-speech-schema';


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d: Buffer) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateAudioFlow = ai.defineFlow(
  {
    name: 'generateAudioFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text }) => {
    
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const { media } = await ai.generate({
              model: googleAI.model('gemini-2.5-flash-preview-tts'),
              config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A calm, clear voice
                  },
                },
              },
              prompt: text,
            });
            
            if (!media) {
              throw new Error('No audio was generated.');
            }
            
            const audioBuffer = Buffer.from(
              media.url.substring(media.url.indexOf(',') + 1),
              'base64'
            );
            
            const wavBase64 = await toWav(audioBuffer);

            return {
              audioDataUri: 'data:audio/wav;base64,' + wavBase64,
            };
        } catch (error: any) {
            if (i === maxRetries - 1) {
                // If it's the last retry, throw the error
                console.error(`Audio generation failed after ${maxRetries} attempts for text: "${text}"`, error);
                throw error;
            }
            // Wait for a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
    
    // This part should be unreachable if maxRetries > 0, but as a fallback:
    throw new Error('Audio generation failed after all retries.');
  }
);


export async function generateAudio(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    return generateAudioFlow(input);
}
