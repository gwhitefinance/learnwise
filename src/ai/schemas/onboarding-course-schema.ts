
/**
 * @fileoverview Defines the data schemas for the onboarding course generation feature.
 */
import { z } from 'zod';

export const GenerateOnboardingCourseInputSchema = z.object({
  gradeLevel: z.string().describe('The grade level of the user (e.g., "High School", "College").'),
  interests: z.array(z.string()).describe('A list of topics the user is interested in.'),
});
export type GenerateOnboardingCourseInput = z.infer<typeof GenerateOnboardingCourseInputSchema>;


export const GenerateOnboardingCourseOutputSchema = z.object({
  courseName: z.string().describe('The generated name for the starter course.'),
  courseDescription: z.string().describe('The generated description for the starter course.'),
});
export type GenerateOnboardingCourseOutput = z.infer<typeof GenerateOnboardingCourseOutputSchema>;
