
'use server';
/**
 * @fileOverview An AI flow for generating a step-by-step problem-solving walkthrough.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { ProblemSolvingInputSchema, ProblemSolvingOutputSchema, type ProblemSolvingInput, type ProblemSolvingSession } from '@/ai/schemas/problem-solving-schema';

const problemSolvingPrompt = ai.definePrompt({
    name: 'problemSolvingPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: ProblemSolvingInputSchema },
    output: { schema: ProblemSolvingOutputSchema },
    prompt: `You are an expert tutor. Your goal is to teach a student how to solve a problem by walking them through an example and then giving them a similar one to practice.

    Topic: "{{topic}}"
    
    **CRITICAL INSTRUCTIONS**:
    1.  **Example Problem**: Create a clear, typical example problem for the specified topic.
    2.  **Step-by-Step Solution**: Provide a detailed, easy-to-follow, step-by-step solution for the example problem. Break it down into logical parts.
    3.  **Practice Problem**: Create a new, similar practice problem for the student to solve on their own. It must test the same concepts but use different values or context.
    4.  **Practice Answer**: Provide the correct answer for the practice problem.
    5.  **Mathematical Notation**: For ALL mathematical expressions, especially exponents and fractions, use proper notation. For example, use 'x²' instead of 'x^2', and use Unicode characters like '½' for fractions instead of '1/2'.

    Generate the full problem-solving session.
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
