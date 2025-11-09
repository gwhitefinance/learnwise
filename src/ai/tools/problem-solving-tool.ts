'use server';
/**
 * @fileOverview A Genkit tool for solving math and science problems.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateProblemSolvingSession } from '../flows/problem-solving-flow';

const ProblemInputSchema = z.object({
  problem: z.string().describe('A math or science problem to be solved.'),
  context: z.string().optional().describe('Any additional context or formulas needed to solve the problem.'),
});

const ProblemOutputSchema = z.object({
    solution: z.string().describe("The final answer to the problem."),
    steps: z.array(z.string()).describe("The step-by-step process used to arrive at the solution."),
});

export const problemSolvingTool = ai.defineTool(
  {
    name: 'problemSolvingTool',
    description: 'Solves complex math and science problems, providing a step-by-step solution.',
    inputSchema: ProblemInputSchema,
    outputSchema: ProblemOutputSchema,
  },
  async ({ problem, context }) => {
    try {
      const result = await generateProblemSolvingSession({ topic: problem });
      return {
          solution: result.practiceProblem.answer,
          steps: result.stepByStepSolution
      };
    } catch (error: any) {
        console.error("Error solving problem:", error);
        return {
            solution: "Could not solve the problem.",
            steps: [error.message || "An unexpected error occurred in the solver."]
        }
    }
  }
);
