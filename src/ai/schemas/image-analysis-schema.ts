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


const SolvedProblemSchema = z.object({
    problem: z.string().describe("The original question or problem identified from the image."),
    steps: z.array(z.string()).describe("A detailed, step-by-step walkthrough of the solution. Each step should be a separate string in the array."),
    answer: z.string().describe("The final, conclusive answer to the problem."),
});

export const AnalyzeImageOutputSchema = z.object({
  solutions: z.array(SolvedProblemSchema).describe("An array of solved problems found in the image. Each item contains the problem, the steps to solve it, and the final answer."),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;
