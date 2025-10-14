
'use server';
/**
 * @fileOverview A flow for generating a comprehensive midterm exam.
 *
 * - generateMidtermExam - A function that generates a 35-question quiz based on the first half of a course.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateMidtermExamInput, GenerateMidtermExamInputSchema } from '@/ai/schemas/midterm-exam-schema';
import { GenerateQuizOutput, GenerateQuizOutputSchema } from '@/ai/schemas/quiz-schema';

const prompt = ai.definePrompt({
    name: 'midtermExamGenerationPrompt',
    model: googleAI.model('gemini-2.0-flash'),
    input: { schema: GenerateMidtermExamInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `You are an expert educator. Generate a 35-question multiple-choice midterm exam based *only* on the provided course content, which represents the first half of the course.

    The user is a {{learnerType}} learner. Tailor the questions accordingly:
    - For Visual learners, ask questions that require them to visualize or describe concepts.
    - For other learner types, create standard multiple-choice questions.

    Course Content:
    "{{courseContent}}"

    For each question, provide the question text, 4 multiple choice options, and the correct answer.
    `,
});


const generateMidtermExamFlow = ai.defineFlow(
  {
    name: 'generateMidtermExamFlow',
    inputSchema: GenerateMidtermExamInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate midterm exam.');
    }
    return output;
  }
);

export async function generateMidtermExam(input: GenerateMidtermExamInput): Promise<GenerateQuizOutput> {
    return generateMidtermExamFlow(input);
}
