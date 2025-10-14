
'use server';
/**
 * @fileOverview A flow for generating flashcards from a course module.
 *
 * - generateFlashcardsFromModule - A function that generates flashcards based on module content.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateFlashcardsOutputSchema, GenerateFlashcardsOutput } from '@/ai/schemas/note-to-flashcard-schema';
import { GenerateModuleFlashcardsInputSchema, GenerateModuleFlashcardsInput } from '@/ai/schemas/module-flashcard-schema';

const prompt = ai.definePrompt({
    name: 'moduleToFlashcardGenerationPrompt',
    model: googleAI.model('gemini-2.0-flash'),
    input: { schema: GenerateModuleFlashcardsInputSchema },
    output: { schema: GenerateFlashcardsOutputSchema },
    prompt: `You are an expert at creating study materials. 
    Generate a set of 5-7 flashcards based *only* on the provided course module content.

    For each flashcard, provide a "front" with a key term or question, and a "back" with the corresponding definition or answer.

    The user is a {{learnerType}} learner. 
    - For Visual learners, create questions that involve describing something.
    - For other types, create standard question/answer flashcards.

    Module Content:
    "{{moduleContent}}"
    `,
});


const generateFlashcardsFromModuleFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFromModuleFlow',
    inputSchema: GenerateModuleFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate flashcards from module.');
    }
    return output;
  }
);

export async function generateFlashcardsFromModule(input: GenerateModuleFlashcardsInput): Promise<GenerateFlashcardsOutput> {
    return generateFlashcardsFromModuleFlow(input);
}
