
'use server';
/**
 * @fileOverview A flow for providing an AI-powered tutoring session based on a block of text.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { TutoringSessionOutput, TutoringSessionOutputSchema } from '@/ai/schemas/image-tutoring-schema';

const TextTutoringInputSchema = z.object({
  textContent: z.string().describe('The text content to be analyzed (e.g., from a video transcript or document).'),
  prompt: z.string().optional().describe('An optional user prompt or question about the content.'),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});

export type TextTutoringInput = z.infer<typeof TextTutoringInputSchema>;


const tutoringPrompt = ai.definePrompt({
    name: 'textTutoringPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: TextTutoringInputSchema },
    output: { schema: TutoringSessionOutputSchema },
    prompt: `You are a friendly, expert AI tutor. Your goal is to help a student understand the concepts in the provided text content. You will break down the problems, explain the core concepts, and provide practice material.

    **CRITICAL**: For any mathematical expressions, especially exponents and fractions, use proper notation. For example, use 'x²' instead of 'x^2', and use Unicode characters like '½' for fractions instead of '1/2'.

    The user's learning style is {{learnerType}}. Tailor your explanation and examples accordingly:
    - Visual: Use highly descriptive language, analogies, and suggest creating diagrams.
    - Auditory: Explain things in a conversational, step-by-step manner, as if you were speaking.
    - Kinesthetic: Use real-world, tangible examples and suggest hands-on activities.
    - Reading/Writing: Provide clear, well-structured text, definitions, and summaries.

    Analyze the text and the user's prompt. Then, provide the following:
    1.  **Conceptual Explanation**: A clear, tailored explanation of the main concepts or methods found in the text.
    2.  **Step-by-Step Walkthrough**: If the text describes a process or problem, provide a detailed, step-by-step guide for one key part. If not, provide a detailed example of a core concept.
    3.  **Key Concepts**: A list of 3-5 crucial vocabulary terms or key concepts from the material.
    4.  **Practice Question**: A single, new multiple-choice practice question based on the text content, including four options and the correct answer.
    5.  **Personalized Advice**: A short (1-2 sentences) piece of advice on how to approach this topic based on their learning style.

    User's Question/Prompt: {{#if prompt}}{{prompt}}{{else}}No specific question provided.{{/if}}

    Text Content for analysis:
    '''
    {{textContent}}
    '''
    `,
});


const generateTextTutoringSessionFlow = ai.defineFlow(
  {
    name: 'generateTextTutoringSessionFlow',
    inputSchema: TextTutoringInputSchema,
    outputSchema: TutoringSessionOutputSchema,
  },
  async (input) => {
    const { output } = await tutoringPrompt(input);
    
    if (!output) {
        throw new Error('Failed to generate tutoring session from text.');
    }
    return output;
  }
);


export async function generateTextTutoringSession(input: TextTutoringInput): Promise<TutoringSessionOutput> {
    return generateTextTutoringSessionFlow(input);
}
