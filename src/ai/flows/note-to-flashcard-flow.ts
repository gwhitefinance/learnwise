
'use server';
/**
 * @fileOverview A flow for generating flashcards from a note.
 *
 * - generateFlashcardsFromNote - A function that generates flashcards based on note content.
 */
import { ai, googleAI } from '@/ai/genkit';
import { GenerateFlashcardsInputSchema, GenerateFlashcardsInput, GenerateFlashcardsOutputSchema, GenerateFlashcardsOutput } from '@/ai/schemas/note-to-flashcard-schema';

const prompt = ai.definePrompt({
    name: 'noteToFlashcardGenerationPrompt',
    model: googleAI.model('gemini-2.0-flash'),
    input: { schema: GenerateFlashcardsInputSchema },
    output: { schema: GenerateFlashcardsOutputSchema },
    prompt: `You are an expert at creating study materials. 
    Generate a set of 5-10 flashcards based *only* on the provided note content.

    For each flashcard, provide a "front" with a key term or question, and a "back" with the corresponding definition or answer.
    Keep the content concise and focused on the most important information in the note.

    The user is a {{learnerType}} learner. 
    - For Visual learners, try to create questions that might involve describing something.
    - For Reading/Writing learners, focus on definitions and key concepts.
    - For other types, create standard question/answer flashcards.

    Note Content:
    "{{noteContent}}"
    `,
});


const generateFlashcardsFromNoteFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFromNoteFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate flashcards from note.');
    }
    return output;
  }
);

export async function generateFlashcardsFromNote(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
    return generateFlashcardsFromNoteFlow(input);
}
