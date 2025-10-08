/**
 * @fileoverview Defines the data schemas for the course-from-URL generation feature.
 */
import { z } from 'zod';

export const GenerateCourseFromUrlInputSchema = z.object({
  courseName: z.string().describe('The name of the course.'),
  courseDescription: z.string().optional().describe('The description of the course.'),
  courseUrl: z.string().url().describe('The URL of the course page to scrape.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
  webContent: z.string().optional().describe("The text content scraped from the course URL. This is added by the flow, not the user.")
});
export type GenerateCourseFromUrlInput = z.infer<typeof GenerateCourseFromUrlInputSchema>;

const ChapterSchema = z.object({
  title: z.string().describe('The title of the chapter.'),
  content: z.string().describe('The educational content for this chapter, explained clearly and in detail based on the scraped content.'),
  activity: z.string().describe('A suggested activity or exercise based on the content, tailored to the user\'s learning style.'),
});

const ModuleSchema = z.object({
  title: z.string().describe('The title of the course module.'),
  chapters: z.array(ChapterSchema),
});

export const GenerateCourseFromUrlOutputSchema = z.object({
  courseTitle: z.string().describe('The generated title for the mini-course, extracted from the webpage content.'),
  modules: z.array(ModuleSchema),
});
export type GenerateCourseFromUrlOutput = z.infer<typeof GenerateCourseFromUrlOutputSchema>;
