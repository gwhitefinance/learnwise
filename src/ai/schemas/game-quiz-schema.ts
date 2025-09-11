
/**
 * @fileoverview Defines the data schemas for the game quiz feature.
 */
import { z } from 'zod';

export const GameQuestionInputSchema = z.object({
  topic: z.string().describe('The topic for the question.'),
});
export type GameQuestionInput = z.infer<typeof GameQuestionInputSchema>;


export const GameQuestionSchema = z.object({
    question: z.string().describe("A concise, clear question about the topic."),
    options: z.array(z.string()).length(4).describe("Four multiple-choice options."),
    answer: z.string().describe("The correct answer from the options."),
});
export type GameQuestion = z.infer<typeof GameQuestionSchema>;

    