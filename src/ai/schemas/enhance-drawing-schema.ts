
/**
 * @fileoverview Defines the data schemas for the drawing enhancement feature.
 */
import { z } from 'zod';

export const EnhanceDrawingInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A drawing from the whiteboard, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnhanceDrawingInput = z.infer<typeof EnhanceDrawingInputSchema>;


export const EnhanceDrawingOutputSchema = z.object({
  enhancedImageDataUri: z.string().describe("The enhanced image as a base64 encoded data URI."),
});
export type EnhanceDrawingOutput = z.infer<typeof EnhanceDrawingOutputSchema>;
