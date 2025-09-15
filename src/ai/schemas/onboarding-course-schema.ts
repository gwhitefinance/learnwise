
/**
 * @fileoverview Defines the data schemas for the onboarding course generation feature.
 */
import { z } from 'zod';
import { GenerateMiniCourseOutputSchema } from './mini-course-schema';


export const GenerateOnboardingCourseInputSchema = z.object({
  gradeLevel: z.string().describe('The grade level of the user (e.g., "High School", "College").'),
  interest: z.string().describe('A single topic the user is interested in.'),
});
export type GenerateOnboardingCourseInput = z.infer<typeof GenerateOnboardingCourseInputSchema>;


// The output is the same as the mini-course output
export const GenerateOnboardingCourseOutputSchema = GenerateMiniCourseOutputSchema;
export type GenerateOnboardingCourseOutput = z.infer<typeof GenerateOnboardingCourseOutputSchema>;
