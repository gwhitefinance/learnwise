
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
  content: z.string().describe('The educational content for this chapter, explained clearly and in detail.'),
  activity: z.string().describe('A suggested activity or exercise based on the content, tailored to the user\'s learning style.'),
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
