
'use server';
/**
 * @fileOverview A flow for providing an AI-powered tutoring session based on an image.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { TutoringSessionInputSchema, TutoringSessionOutputSchema, TutoringSessionInput, TutoringSessionOutput } from '@/ai/schemas/image-tutoring-schema';
import { generateFlashcardsFromNote } from './note-to-flashcard-flow';
import { generateQuizFromNote } from './note-to-quiz-flow';

const tutoringPrompt = ai.definePrompt({
    name: 'imageTutoringPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: TutoringSessionInputSchema },
    output: { schema: TutoringSessionOutputSchema },
});


const generateTutoringSessionFlow = ai.defineFlow(
  {
    name: 'generateTutoringSessionFlow',
    inputSchema: TutoringSessionInputSchema,
    outputSchema: TutoringSessionOutputSchema,
  },
  async (input) => {
    // Extract mime type from data uri
    const contentType = input.imageDataUri.match(/data:(.*);base64,/)?.[1] ?? 'image/jpeg';

    const { output } = await tutoringPrompt(
        {
            ...input
        },
        {
            prompt: `You are a friendly, expert AI tutor. Your goal is to help a student understand the concepts in the provided image of their homework. You will break down the problems, explain the core concepts, and provide practice material.

    **CRITICAL**: For any mathematical expressions, especially exponents and fractions, use proper notation. For example, use 'x²' instead of 'x^2', and use Unicode characters like '½' for fractions instead of '1/2'.

    The user's learning style is {{learnerType}}. Tailor your explanation and examples accordingly:
    - Visual: Use highly descriptive language, analogies, and suggest creating diagrams.
    - Auditory: Explain things in a conversational, step-by-step manner, as if you were speaking.
    - Kinesthetic: Use real-world, tangible examples and suggest hands-on activities.
    - Reading/Writing: Provide clear, well-structured text, definitions, and summaries.

    Analyze the image and the user's prompt. Then, provide the following:
    1.  **Conceptual Explanation**: A clear, tailored explanation of the main concepts or methods needed to solve the problems in the image.
    2.  **Step-by-Step Walkthrough**: A detailed, step-by-step guide for ONE of the problems. Choose the best one to demonstrate the concept.
    3.  **Key Concepts**: A list of 3-5 crucial vocabulary terms or key concepts from the material.
    4.  **Practice Question**: A single, new multiple-choice practice question based on the homework, including four options and the correct answer.
    5.  **Personalized Advice**: A short (1-2 sentences) piece of advice on how to approach this topic based on their learning style.

    User's Question/Prompt: {{#if prompt}}{{prompt}}{{else}}No specific question provided.{{/if}}`,
            context: [
              { media: { url: input.imageDataUri, contentType } },
            ]
        }
    );
    
    if (!output) {
        throw new Error('Failed to generate tutoring session.');
    }
    return output;
  }
);


export async function generateTutoringSession(input: TutoringSessionInput): Promise<TutoringSessionOutput> {
    return generateTutoringSessionFlow(input);
}
