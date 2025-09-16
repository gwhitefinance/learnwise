
'use server';
/**
 * @fileOverview A flow for generating a personalized motivational message.
 *
 * - generateMotivationalMessage - A function that generates a short, encouraging message.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MotivationalMessageInputSchema = z.object({
  userName: z.string().describe("The name of the user to address."),
});
export type MotivationalMessageInput = z.infer<typeof MotivationalMessageInputSchema>;

const MotivationalMessageOutputSchema = z.object({
  message: z.string().describe('A short (1-2 sentence) motivational message for a student.'),
});
export type MotivationalMessageOutput = z.infer<typeof MotivationalMessageOutputSchema>;

const prompt = ai.definePrompt({
    name: 'motivationalMessagePrompt',
    input: { schema: MotivationalMessageInputSchema },
    output: { schema: MotivationalMessageOutputSchema },
    prompt: `You are a cheerful and encouraging study buddy. 
    Generate a short (1-2 sentence) motivational message for {{userName}} to start their study session.
    Keep it positive and uplifting.
    
    Example: "You've got this, {{userName}}! Every step forward is a victory."
    `,
});

const generateMotivationalMessageFlow = ai.defineFlow(
  {
    name: 'generateMotivationalMessageFlow',
    inputSchema: MotivationalMessageInputSchema,
    outputSchema: MotivationalMessageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate motivational message.');
    }
    return output;
  }
);

export async function generateMotivationalMessage(input: MotivationalMessageInput): Promise<MotivationalMessageOutput> {
    return generateMotivationalMessageFlow(input);
}
