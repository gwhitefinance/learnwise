
'use server';
/**
 * @fileOverview A flow for generating short mindfulness exercises.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateMindfulnessExerciseInput, GenerateMindfulnessExerciseInputSchema, GenerateMindfulnessExerciseOutput, GenerateMindfulnessExerciseOutputSchema } from '@/ai/schemas/mindfulness-schema';

const prompt = ai.definePrompt({
    name: 'mindfulnessExercisePrompt',
    model: googleAI.model('gemini-2.0-flash-lite'),
    input: { schema: GenerateMindfulnessExerciseInputSchema },
    output: { schema: GenerateMindfulnessExerciseOutputSchema },
    prompt: `You are a calm and supportive mindfulness guide. Your task is to generate a short, simple, and effective mindfulness exercise for a student who needs a quick break.

    The student is feeling: {{feeling}}

    Based on their feeling, generate ONE of the following:
    1.  A 1-minute breathing exercise with simple, clear steps.
    2.  A short (2-3 sentences) calming thought or affirmation.
    3.  A simple grounding technique (e.g., "5-4-3-2-1" method).

    Keep the title concise (2-4 words) and the exercise easy to follow. The tone should be gentle, encouraging, and soothing.
    `,
});


const generateMindfulnessExerciseFlow = ai.defineFlow(
  {
    name: 'generateMindfulnessExerciseFlow',
    inputSchema: GenerateMindfulnessExerciseInputSchema,
    outputSchema: GenerateMindfulnessExerciseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate mindfulness exercise.');
    }
    return output;
  }
);

export async function generateMindfulnessExercise(input: GenerateMindfulnessExerciseInput): Promise<GenerateMindfulnessExerciseOutput> {
    return generateMindfulnessExerciseFlow(input);
}
