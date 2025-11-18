
'use server';
/**
 * @fileOverview A flow for generating a practice quiz from an image.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateImageQuizInputSchema, type GenerateImageQuizInput } from '@/ai/schemas/image-to-quiz-schema';
import { GenerateQuizOutput, GenerateQuizOutputSchema } from '@/ai/schemas/quiz-schema';


const prompt = ai.definePrompt({
    name: 'imageToQuizGenerationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GenerateImageQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `You are an expert educator. Analyze the content of the provided image and generate a {{numQuestions}}-question multiple-choice quiz based on it.

    The quiz should have the following parameters:
    - Difficulty Level: {{difficulty}}
    - Each question must have exactly 4 options.
    - The 'correctAnswer' must be one of the strings from the 'options' array.

    Image Content:
    {{media url=imageDataUri}}

    CRITICAL: For any mathematical expressions, especially exponents and fractions, use proper notation. For example, use 'x²' instead of 'x^2', and use Unicode characters like '½' for fractions instead of '1/2'.

    Generate the quiz now.
    `,
});


const generateImageQuizFlow = ai.defineFlow(
  {
    name: 'generateImageQuizFlow',
    inputSchema: GenerateImageQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate quiz from image.');
    }
    return output;
  }
);

export async function generateImageQuiz(input: GenerateImageQuizInput): Promise<GenerateQuizOutput> {
    return generateImageQuizFlow(input);
}
