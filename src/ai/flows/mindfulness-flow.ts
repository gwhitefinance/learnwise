
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
    prompt: `You are a calm, gentle, and supportive mindfulness guide for students. Your task is to generate a short, simple, and effective mindfulness exercise based on how a student is feeling.

    The student is feeling: {{feeling}}

    Based on their feeling, generate ONE of the following types of exercises:
    1.  **Breathing Exercise**: Simple, clear steps for a 1-minute breathing technique. (e.g., for "Anxious", suggest box breathing).
    2.  **Grounding Technique**: A simple sensory exercise to bring them to the present moment. (e.g., for "Stressed", suggest the 5-4-3-2-1 method).
    3.  **Affirmation/Calming Thought**: A short, positive, and reassuring statement (2-3 sentences). (e.g., for "Sad", offer a comforting thought).

    Keep the title concise (2-4 words) and the exercise text easy to follow for a young audience. The tone should always be gentle, encouraging, and soothing. Make it feel personal and caring. Do not be generic.
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
