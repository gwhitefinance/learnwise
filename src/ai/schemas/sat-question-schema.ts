

/**
 * @fileoverview Defines the data schemas for the SAT Question of the Day feature.
 */
import { z } from 'zod';

export const GenerateSatQuestionInputSchema = z.object({
  seed: z.string().describe('A seed to ensure a unique question daily, e.g., the current date.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateSatQuestionInput = z.infer<typeof GenerateSatQuestionInputSchema>;


export const SatQuestionSchema = z.object({
  category: z.enum(['Math', 'Reading & Writing']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the question.'),
  topic: z.string().describe('The main topic of the question, e.g., "Craft and Structure", "Algebra".'),
  subTopic: z.string().describe('A more specific topic for the question, e.g., "Words in Context", "Linear Equations".'),
  passage: z.string().optional().describe('A short passage for Reading & Writing questions, if applicable.'),
  question: z.string().describe('The SAT-style question.'),
  options: z.array(z.string()).length(4).describe('An array of four multiple-choice options.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
  explanation: z.string().describe('A detailed explanation for the correct answer, tailored to the learner type.'),
});
export type SatQuestion = z.infer<typeof SatQuestionSchema>;

