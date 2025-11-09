
'use server';
/**
 * @fileOverview An AI flow for generating a step-by-step problem-solving walkthrough.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { ProblemSolvingInputSchema, ProblemSolvingOutputSchema, type ProblemSolvingInput, type ProblemSolvingSession } from '@/ai/schemas/problem-solving-schema';
import { mathSolverTool } from '../tools/math-solver-tool';

const problemSolvingPrompt = ai.definePrompt({
    name: 'problemSolvingPrompt',
    model: googleAI.model('gemini-2.5-pro'),
    input: { schema: ProblemSolvingInputSchema },
    output: { schema: ProblemSolvingOutputSchema },
    tools: [mathSolverTool],
    prompt: `You are an expert tutor capable of solving any academic problem. Your goal is to provide a clear, step-by-step solution to the user's question, followed by a final, verified answer.

    Problem: "{{topic}}"
    
    **CRITICAL INSTRUCTIONS**:
    1.  **Step-by-Step Solution**: Provide a detailed, easy-to-follow, step-by-step solution for the given problem. Break it down into logical parts.
    2.  **Final Answer**: After the steps, provide a definitive final answer.
    3.  **Verification**: If the problem involves calculation, use the 'mathSolverTool' to verify your final answer.
    4.  **Mathematical Notation**: For ALL mathematical expressions, especially exponents and fractions, use proper notation. For example, use 'x²' instead of 'x^2', and use Unicode characters like '½' for fractions instead of '1/2'.

    Generate the full solution.
    `,
});

const generateProblemSolvingSessionFlow = ai.defineFlow(
    {
        name: 'generateProblemSolvingSessionFlow',
        inputSchema: ProblemSolvingInputSchema,
        outputSchema: ProblemSolvingOutputSchema,
    },
    async (input) => {
        const { output } = await problemSolvingPrompt(input);
        if (!output) {
            throw new Error('Failed to generate problem-solving session.');
        }
        return output;
    }
);

export async function generateProblemSolvingSession(input: ProblemSolvingInput): Promise<ProblemSolvingSession> {
    return generateProblemSolvingSessionFlow(input);
}
