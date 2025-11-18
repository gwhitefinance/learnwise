
'use server';
/**
 * @fileOverview A flow for generating a practice quiz from a course unit.
 *
 * - generateQuizFromUnit - A function that generates a quiz based on unit content.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateUnitQuizInputSchema, GenerateUnitQuizInput } from '@/ai/schemas/unit-quiz-schema';
import { GenerateQuizOutput, GenerateQuizOutputSchema } from '@/ai/schemas/quiz-schema';

const prompt = ai.definePrompt({
    name: 'unitToQuizGenerationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GenerateUnitQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `You are an expert educator. Generate a 15-question multiple-choice quiz based *only* on the provided course unit content.

    The user is a {{learnerType}} learner. Tailor the questions accordingly:
    - For Visual learners, ask questions that require them to visualize or describe concepts.
    - For other learner types, create standard multiple-choice questions.

    Unit Content:
    "{{unitContent}}"

    For each question, provide the question text, 4 multiple choice options, and the correct answer.
    `,
});


const generateQuizFromUnitFlow = ai.defineFlow(
  {
    name: 'generateQuizFromUnitFlow',
    inputSchema: GenerateUnitQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate quiz from unit.');
    }
    return output;
  }
);

export async function generateQuizFromUnit(input: GenerateUnitQuizInput): Promise<GenerateQuizOutput> {
    return generateQuizFromUnitFlow(input);
}
