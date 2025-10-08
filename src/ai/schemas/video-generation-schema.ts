/**
 * @fileoverview Defines the data schemas for the video generation feature.
 */
import { z } from 'zod';

export const GenerateVideoInputSchema = z.object({
  prompt: z.string().describe('A detailed prompt for the text-to-video model.'),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;


export const GenerateVideoOutputSchema = z.object({
  media: z.string().describe('The generated video as a data URI.'),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;
