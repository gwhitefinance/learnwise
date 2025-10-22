/**
 * @fileOverview A flow for generating detailed content for a single course chapter.
 */
import { z } from 'zod';

export const GenerateChapterContentInputSchema = z.object({
  courseName: z.string().describe('The name of the overall course.'),
  moduleTitle: z.string().describe('The title of the module this chapter belongs to.'),
  chapterTitle: z.string().describe('The title of the chapter to generate content for.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});

export const GenerateChapterContentOutputSchema = z.object({
  content: z.string().describe('The detailed, essay-length educational content for the chapter.'),
  activity: z.string().describe('A suggested, interactive activity based on the chapter content, tailored to the learner\'s style.'),
  interactiveTool: z.string().optional().describe('A URL to an interactive learning tool or simulation relevant to the chapter. Should be a simple, single-page web app. (e.g. a simple calculator, a physics simulation).'),
});

export type GenerateChapterContentInput = z.infer<typeof GenerateChapterContentInputSchema>;
export type GenerateChapterContentOutput = z.infer<typeof GenerateChapterContentOutputSchema>;
