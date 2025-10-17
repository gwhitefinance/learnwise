
/**
 * @fileoverview Defines the data schemas for the mindfulness exercise generation feature.
 */
import { z } from 'zod';

export const GenerateMindfulnessExerciseInputSchema = z.object({
  feeling: z.string().describe('The user\'s current feeling (e.g., "stressed", "anxious", "unfocused").'),
});
export type GenerateMindfulnessExerciseInput = z.infer<typeof GenerateMindfulnessExerciseInputSchema>;


export const GenerateMindfulnessExerciseOutputSchema = z.object({
  title: z.string().describe('A short, calming title for the exercise (2-4 words).'),
  exercise: z.string().describe('The steps or text for the mindfulness exercise. Should be simple and concise.'),
  type: z.enum(['Breathing', 'Affirmation', 'Grounding']).describe('The type of exercise generated.'),
});
export type GenerateMindfulnessExerciseOutput = z.infer<typeof GenerateMindfulnessExerciseOutputSchema>;
