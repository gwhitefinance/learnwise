import { z } from 'zod';
import { GenerateMiniCourseOutputSchema } from '@/ai/schemas/mini-course-schema';

export const GenerateCourseFromMaterialsInputSchema = z.object({
  courseName: z.string().describe("The desired name for the new course."),
  textContext: z.string().optional().describe("A collection of raw text snippets."),
  urls: z.array(z.string().url()).optional().describe("A list of URLs to scrape for content."),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateCourseFromMaterialsInput = z.infer<typeof GenerateCourseFromMaterialsInputSchema>;

export const GenerateCourseFromMaterialsOutputSchema = GenerateMiniCourseOutputSchema;
export type GenerateCourseFromMaterialsOutput = z.infer<typeof GenerateCourseFromMaterialsOutputSchema>;
