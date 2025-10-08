/**
 * @fileoverview Defines the data schemas for the image analysis feature.
 */
import { z } from 'zod';

export const AnalyzeImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().optional().describe('An optional prompt or question about the image.'),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;


export const AnalyzeImageOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis or summary of the image content.'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;
