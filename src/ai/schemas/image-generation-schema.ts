
/**
 * @fileoverview Defines the data schemas for the image generation feature.
 */
import { z } from 'zod';

export const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A detailed prompt for the text-to-image model.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;


export const GenerateImageOutputSchema = z.object({
  media: z.string().describe('The generated image as a data URI.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;
