
'use server';
/**
 * @fileOverview A flow for generating different types of explanations for a key concept.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { ConceptExplanationInputSchema, ConceptExplanationOutputSchema, ConceptExplanationInput, ConceptExplanationOutput } from '@/ai/schemas/concept-explanation-schema';


const prompt = ai.definePrompt({
    name: 'conceptExplanationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: ConceptExplanationInputSchema },
    output: { schema: ConceptExplanationOutputSchema },
    prompt: `You are an expert tutor who excels at explaining complex topics in simple and creative ways. A student needs help understanding a key term from their course.

    Course Context: {{courseContext}}
    Key Term: "{{term}}"
    Definition: "{{definition}}"
    Requested Explanation Type: "{{explanationType}}"

    Your task is to provide an explanation based on the requested type:
    - If type is "analogy": Create a simple, relatable analogy or metaphor to explain the term.
    - If type is "simple": Rephrase the definition in the simplest possible terms, as if explaining it to a 5-year-old.
    - If type is "sentence": Provide a clear, straightforward sentence that uses the key term correctly in context.

    Provide ONLY the explanation text.
    `,
});

const generateConceptExplanationFlow = ai.defineFlow(
  {
    name: 'generateConceptExplanationFlow',
    inputSchema: ConceptExplanationInputSchema,
    outputSchema: ConceptExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate concept explanation.');
    }
    return output;
  }
);

export async function generateConceptExplanation(input: ConceptExplanationInput): Promise<ConceptExplanationOutput> {
    return generateConceptExplanationFlow(input);
}
