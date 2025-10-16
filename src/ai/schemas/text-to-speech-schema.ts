
import { z } from 'zod';

// Define the schema for the audio generation input
export const GenerateAudioInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type GenerateAudioInput = z.infer<typeof GenerateAudioInputSchema>;

// Define the schema for the audio generation output
export const GenerateAudioOutputSchema = z.object({
  audio: z.string().describe('The generated audio as a base64 encoded data URI.'),
});
export type GenerateAudioOutput = z.infer<typeof GenerateAudioOutputSchema>;
