
/**
 * @fileoverview Defines the data schemas for the text-to-speech feature.
 */
import { z } from 'zod';

export const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text content to convert to speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;


export const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a data URI.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;
