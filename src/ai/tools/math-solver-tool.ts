
'use server';
/**
 * @fileOverview A Genkit tool for accurately solving mathematical expressions.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MathSolverInputSchema = z.object({
  expression: z.string().describe('The mathematical expression to evaluate.'),
});

export const mathSolverTool = ai.defineTool(
  {
    name: 'mathSolverTool',
    description: 'A tool that evaluates a mathematical expression and returns the result. Use this to verify calculations.',
    inputSchema: MathSolverInputSchema,
    outputSchema: z.string(),
  },
  async ({ expression }) => {
    try {
      // Basic safety: only allow numbers, operators, and parentheses.
      if (!/^[0-9\s\+\-\*\/\(\)\.]+$/.test(expression)) {
        throw new Error('Invalid characters in expression');
      }
      // Using a safer method to evaluate math expressions.
      const result = new Function(`return ${expression}`)();
      return String(result);
    } catch (error) {
      console.error('Math evaluation error:', error);
      return 'Error: Could not evaluate expression';
    }
  }
);
