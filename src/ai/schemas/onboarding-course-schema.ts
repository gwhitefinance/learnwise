
/**
 * @fileoverview Defines the data schemas for the onboarding course generation feature.
 */
import { z } from 'zod';

export const GenerateOnboardingCourseInputSchema = z.object({
  gradeLevel: z.string().describe('The grade level of the user (e.g., "High School", "College").'),
  interest: z.string().describe('A single topic the user is interested in.'),
});
export type GenerateOnboardingCourseInput = z.infer<typeof GenerateOnboardingCourseInputSchema>;


// The output is now a simple title and description, not the full course.
export const GenerateOnboardingCourseOutputSchema = z.object({
    courseTitle: z.string().describe("A creative and engaging title for a course based on the user's interest."),
    courseDescription: z.string().describe("A compelling, one-paragraph description for the course."),
});
export type GenerateOnboardingCourseOutput = z.infer<typeof GenerateOnboardingCourseOutputSchema>;
