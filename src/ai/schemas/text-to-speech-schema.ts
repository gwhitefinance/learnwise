
import { z } from 'zod';

export const GenerateSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});

export const GenerateSpeechOutputSchema = z.object({
  audioUrl: z.string().describe('The data URI of the generated audio file.'),
});
