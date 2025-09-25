
/**
 * @fileoverview Defines the data schemas for the mini-course generation feature.
 */
import { z } from 'zod';

export const GenerateMiniCourseInputSchema = z.object({
  courseName: z.string().describe('The name of the course.'),
  courseDescription: z.string().describe('A brief description of the course.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateMiniCourseInput = z.infer<typeof GenerateMiniCourseInputSchema>;

const ChapterSchema = z.object({
  title: z.string().describe('The title of the chapter.'),
  content: z.string().describe("The educational content for this chapter. This should be a long, detailed, essay-length text."),
  activity: z.string().describe("A suggested activity or exercise based on the content."),
  interactiveTool: z.string().url().or(z.literal('')).describe("An optional URL to an interactive tool or simulation (e.g., a PhET simulation embed URL). This should be a valid URL or an empty string."),
});

const ModuleSchema = z.object({
  title: z.string().describe('The title of the course module.'),
  chapters: z.array(ChapterSchema),
});

export const GenerateMiniCourseOutputSchema = z.object({
  courseTitle: z.string().describe('The generated title for the mini-course.'),
  modules: z.array(ModuleSchema),
});
export type GenerateMiniCourseOutput = z.infer<typeof GenerateMiniCourseOutputSchema>;
