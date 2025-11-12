
'use server';
/**
 * @fileOverview A flow for generating hints for quiz questions.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateHintInputSchema, GenerateHintOutputSchema, GenerateHintInput, GenerateHintOutput } from '@/ai/schemas/quiz-hint-schema';

const prompt = ai.definePrompt({
    name: 'quizHintPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GenerateHintInputSchema },
    output: { schema: GenerateHintOutputSchema },
    prompt: `You are an expert tutor. A student is stuck on a quiz question and has asked for a hint.

    Original Question: "{{question}}"
    Correct Answer: "{{correctAnswer}}"
    Options: {{#each options}} - {{this}} {{/each}}

    Your task is to provide a short, one-sentence hint.
    
    **CRITICAL INSTRUCTIONS**:
    1.  **DO NOT** give away the answer directly.
    2.  **DO NOT** just rephrase the question.
    3.  Guide the student toward the correct concept or line of thinking.
    4.  Keep it concise and encouraging.

    Example:
    - Question: "What is the capital of France?"
    - Correct Answer: "Paris"
    - Good Hint: "Think about the city famous for the Eiffel Tower."
    - Bad Hint: "The answer is a famous city in Europe." (Too vague)
    - Bad Hint: "The answer is Paris." (Gives away the answer)
    `,
});

const generateHintFlow = ai.defineFlow(
  {
    name: 'generateHintFlow',
    inputSchema: GenerateHintInputSchema,
    outputSchema: GenerateHintOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate hint.');
    }
    return output;
  }
);

export async function generateHint(input: GenerateHintInput): Promise<GenerateHintOutput> {
    return generateHintFlow(input);
}
