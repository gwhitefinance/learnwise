
/**
 * @fileoverview Defines the data schemas for the image-based tutoring feature.
 */
import { z } from 'zod';
import { GenerateQuizOutputSchema } from './quiz-schema';
import { GenerateFlashcardsOutputSchema } from './note-to-flashcard-schema';

export const TutoringSessionInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().optional().describe('An optional prompt or question about the image.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type TutoringSessionInput = z.infer<typeof TutoringSessionInputSchema>;

export const PracticeQuestionSchema = z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
});
export type PracticeQuestion = z.infer<typeof PracticeQuestionSchema>;

export const TutoringSessionOutputSchema = z.object({
  conceptualExplanation: z.string().describe("A clear explanation of the main concepts, tailored to the user's learning style."),
  stepByStepWalkthrough: z.string().describe("A detailed, step-by-step guide for one of the problems in the image."),
  keyConcepts: z.array(z.string()).describe("A list of 3-5 crucial vocabulary terms or key concepts from the material."),
  practiceQuestion: PracticeQuestionSchema.describe("A single, new multiple-choice practice question based on the homework."),
  personalizedAdvice: z.string().describe("A short piece of study advice tailored to the user's learning style."),
});
export type TutoringSessionOutput = z.infer<typeof TutoringSessionOutputSchema>;
