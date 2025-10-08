/**
 * @fileOverview A flow for generating detailed content for a single course chapter, including prompts for multimedia.
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
  imagePrompt: z.string().optional().describe("A concise, descriptive prompt for a text-to-image model to generate a relevant header image for this chapter."),
  diagramPrompt: z.string().optional().describe("A detailed prompt for a text-to-image model to generate an educational diagram or chart that visually explains a core concept from the chapter."),
  videoPrompt: z.string().optional().describe("A descriptive prompt for a text-to-video model to generate a short, 5-8 second educational video clip related to the chapter's content."),
});

export type GenerateChapterContentInput = z.infer<typeof GenerateChapterContentInputSchema>;
export type GenerateChapterContentOutput = z.infer<typeof GenerateChapterContentOutputSchema>;
