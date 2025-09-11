
'use server';
/**
 * @fileOverview A flow for generating simple questions for the study game.
 *
 * - generateGameQuestion - A function that generates a single multiple-choice question.
 */
import { ai } from '@/ai/genkit';
import { GameQuestionSchema, GameQuestion, GameQuestionInput, GameQuestionInputSchema } from '@/ai/schemas/game-quiz-schema';

const prompt = ai.definePrompt({
    name: 'gameQuestionPrompt',
    input: { schema: GameQuestionInputSchema },
    output: { schema: GameQuestionSchema },
    prompt: `You are an AI that creates simple, flashcard-style questions for a study game.
    Based on the topic provided, generate one clear multiple-choice question with four options.
    The question should be concise and test a core concept of the topic.

    Topic: {{topic}}
    `,
});

const generateGameQuestionFlow = ai.defineFlow(
  {
    name: 'generateGameQuestionFlow',
    inputSchema: GameQuestionInputSchema,
    outputSchema: GameQuestionSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate a game question.');
    }
    return output;
  }
);

export async function generateGameQuestion(input: GameQuestionInput): Promise<GameQuestion> {
    return generateGameQuestionFlow(input);
}

    