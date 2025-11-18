
'use server';
/**
 * @fileOverview A flow for generating flashcards from a course unit.
 *
 * - generateFlashcardsFromUnit - A function that generates flashcards based on unit content.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateFlashcardsOutputSchema, GenerateFlashcardsOutput } from '@/ai/schemas/note-to-flashcard-schema';
import { GenerateUnitFlashcardsInputSchema, GenerateUnitFlashcardsInput } from '@/ai/schemas/unit-flashcard-schema';

const prompt = ai.definePrompt({
    name: 'unitToFlashcardGenerationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GenerateUnitFlashcardsInputSchema },
    output: { schema: GenerateFlashcardsOutputSchema },
    prompt: `You are an expert at creating study materials. 
    Generate a set of 5-7 flashcards based *only* on the provided course unit content.

    For each flashcard, provide a "front" with a key term or question, and a "back" with the corresponding definition or answer.

    The user is a {{learnerType}} learner. 
    - For Visual learners, create questions that involve describing something.
    - For other types, create standard question/answer flashcards.

    Unit Content:
    "{{unitContent}}"
    `,
});


const generateFlashcardsFromUnitFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFromUnitFlow',
    inputSchema: GenerateUnitFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate flashcards from unit.');
    }
    return output;
  }
);

export async function generateFlashcardsFromUnit(input: GenerateUnitFlashcardsInput): Promise<GenerateFlashcardsOutput> {
    return generateFlashcardsFromUnitFlow(input);
}
