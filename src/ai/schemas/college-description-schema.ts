
/**
 * @fileoverview Defines the data schemas for the college description generator.
 */
import { z } from 'zod';

export const CollegeDescriptionInputSchema = z.object({
  collegeName: z.string().describe("The name of the college to generate a description for."),
});
export type CollegeDescriptionInput = z.infer<typeof CollegeDescriptionInputSchema>;


export const CollegeDescriptionOutputSchema = z.object({
  description: z.string().describe("A brief, engaging 'About' section for the specified university."),
});
export type CollegeDescriptionOutput = z.infer<typeof CollegeDescriptionOutputSchema>;
