
'use server';
/**
 * @fileOverview A flow for generating a practice quiz from a course module.
 *
 * - generateQuizFromModule - A function that generates a quiz based on module content.
 */
import { ai } from '@/ai/genkit';
import { GenerateModuleQuizInputSchema, GenerateModuleQuizInput } from '@/ai/schemas/module-quiz-schema';
import { GenerateQuizOutput, GenerateQuizOutputSchema } from '@/ai/schemas/quiz-schema';

const prompt = ai.definePrompt({
    name: 'moduleToQuizGenerationPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GenerateModuleQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `You are an expert educator. Generate a 3-question multiple-choice quiz based *only* on the provided course module content.

    The user is a {{learnerType}} learner. Tailor the questions accordingly:
    - For Visual learners, ask questions that require them to visualize or describe concepts.
    - For other learner types, create standard multiple-choice questions.

    Module Content:
    "{{moduleContent}}"

    For each question, provide the question text, 4 multiple choice options, and the correct answer.
    `,
});


const generateQuizFromModuleFlow = ai.defineFlow(
  {
    name: 'generateQuizFromModuleFlow',
    inputSchema: GenerateModuleQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate quiz from module.');
    }
    return output;
  }
);

export async function generateQuizFromModule(input: GenerateModuleQuizInput): Promise<GenerateQuizOutput> {
    return generateQuizFromModuleFlow(input);
}
