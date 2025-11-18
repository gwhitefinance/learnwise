
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
  // Content and activity are removed from here, they will be generated on-demand.
});

const UnitSchema = z.object({
  title: z.string().describe('The title of the course unit.'),
  chapters: z.array(ChapterSchema),
});

export const GenerateMiniCourseOutputSchema = z.object({
  courseTitle: z.string().describe('The generated title for the mini-course.'),
  keyConcepts: z.array(z.string()).describe("A list of 5-7 of the most important keywords or concepts for this subject."),
  modules: z.array(UnitSchema).describe("This should be `units`, but the model is stubborn. We'll rename it in the code."),
});
export type GenerateMiniCourseOutput = z.infer<typeof GenerateMiniCourseOutputSchema>;
