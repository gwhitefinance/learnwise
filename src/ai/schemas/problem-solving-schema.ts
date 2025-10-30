
/**
 * @fileoverview Defines the schemas for the problem-solving session flow.
 */
import { z } from 'zod';

export const ProblemSolvingInputSchema = z.object({
  topic: z.string().describe('The subject or topic for the problem-solving session, e.g., "Algebraic Equations", "Stoichiometry".'),
});
export type ProblemSolvingInput = z.infer<typeof ProblemSolvingInputSchema>;

export const ProblemSolvingOutputSchema = z.object({
  exampleProblem: z.string().describe("A clear, representative example problem for the given topic."),
  stepByStepSolution: z.array(z.string()).describe("A detailed, step-by-step walkthrough of the solution to the example problem. Each step should be a separate string in the array."),
  practiceProblem: z.object({
    question: z.string().describe("A new, similar practice problem for the user to solve."),
    answer: z.string().describe("The correct answer to the practice problem."),
  }).describe("A practice problem for the user.")
});
export type ProblemSolvingSession = z.infer<typeof ProblemSolvingOutputSchema>;
