
'use server';
/**
 * @fileOverview A flow for generating audio from text using Gemini TTS.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateAudioInput, GenerateAudioInputSchema, GenerateAudioOutput, GenerateAudioOutputSchema } from '@/ai/schemas/text-to-speech-schema';
import wav from 'wav';

/**
 * Converts raw PCM audio data to a base64-encoded WAV string.
 */
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

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

// Define the main flow for generating audio
const generateAudioFlow = ai.defineFlow(
  {
    name: 'generateAudioFlow',
    inputSchema: GenerateAudioInputSchema,
    outputSchema: GenerateAudioOutputSchema,
  },
  async ({ text }) => {
    // Generate the raw audio data from the Gemini TTS model
    const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'en-US-Studio-M' },
                },
            },
        },
        prompt: text,
    });

    if (!media) {
      throw new Error('No audio media was returned from the model.');
    }

    // The media URL is a data URI, so we need to extract the base64 part
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    // Convert the raw PCM data to WAV format
    const wavBase64 = await toWav(audioBuffer);

    return {
      audio: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);


export async function generateAudio(input: GenerateAudioInput): Promise<GenerateAudioOutput> {
    return generateAudioFlow(input);
}
