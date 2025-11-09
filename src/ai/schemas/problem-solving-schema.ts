
/**
 * @fileoverview Defines the schemas for the problem-solving session flow.
 */
import { z } from 'zod';

export const ProblemSolvingInputSchema = z.object({
  topic: z.string().describe('The subject or problem to be solved, e.g., "Algebraic Equations", "What was the main cause of the French Revolution?".'),
});
export type ProblemSolvingInput = z.infer<typeof ProblemSolvingInputSchema>;

export const ProblemSolvingOutputSchema = z.object({
  steps: z.array(z.string()).describe("A detailed, step-by-step walkthrough of the solution. Each step should be a separate string in the array."),
  answer: z.string().describe("The final, conclusive answer to the problem."),
});
export type ProblemSolvingSession = z.infer<typeof ProblemSolvingOutputSchema>;
