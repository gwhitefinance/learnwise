
'use server';
/**
 * @fileOverview A flow for generating a practice quiz from a note.
 *
 * - generateQuizFromNote - A function that generates a quiz based on note content and learner type.
 */
import { ai, googleAI } from '@/ai/genkit';
import { GenerateNoteQuizInputSchema, GenerateNoteQuizInput } from '@/ai/schemas/note-to-quiz-schema';
import { GenerateQuizOutput, GenerateQuizOutputSchema } from '@/ai/schemas/quiz-schema';

const prompt = ai.definePrompt({
    name: 'noteToQuizGenerationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GenerateNoteQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `You are an expert educator who creates personalized learning materials. 
    Generate a 5-question multiple-choice quiz based *only* on the provided note content.

    The user is a {{learnerType}} learner. Tailor the questions accordingly:
    - For Visual learners, ask questions that require them to visualize or describe concepts from the text.
    - For Reading/Writing learners, create standard multiple-choice questions that test recall and understanding of the text.
    - For other learner types, default to standard multiple-choice questions.

    Note Content:
    "{{noteContent}}"

    For each question, provide the question text, 4 multiple choice options, and the correct answer.
    `,
});


const generateQuizFromNoteFlow = ai.defineFlow(
  {
    name: 'generateQuizFromNoteFlow',
    inputSchema: GenerateNoteQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate quiz from note.');
    }
    return output;
  }
);

export async function generateQuizFromNote(input: GenerateNoteQuizInput): Promise<GenerateQuizOutput> {
    return generateQuizFromNoteFlow(input);
}
