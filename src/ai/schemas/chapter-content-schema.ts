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

const TextBlockSchema = z.object({
  type: z.enum(['text']).describe("The type of this content block, which is 'text'."),
  content: z.string().describe('A paragraph of educational text.'),
});

const QuestionBlockSchema = z.object({
    type: z.enum(['question']).describe("The type of this content block, which is 'question'."),
    question: z.string().describe('A single multiple-choice question to check understanding.'),
    options: z.array(z.string()).length(4).describe('An array of 4 possible answers.'),
    correctAnswer: z.string().describe('The correct answer from the options array.'),
});

export const GenerateChapterContentOutputSchema = z.object({
  content: z.array(z.union([TextBlockSchema, QuestionBlockSchema])).describe('An array of content blocks, mixing detailed text paragraphs and "Check Your Understanding" questions.'),
  activity: z.string().describe('A suggested, interactive activity based on the chapter content, tailored to the learner\'s style.'),
  imageUrl: z.string().url().optional().describe('A URL for a relevant, royalty-free image from a source like Unsplash or Pexels that visually represents the chapter\'s topic.'),
});

export type GenerateChapterContentInput = z.infer<typeof GenerateChapterContentInputSchema>;
export type GenerateChapterContentOutput = z.infer<typeof GenerateChapterContentOutputSchema>;
