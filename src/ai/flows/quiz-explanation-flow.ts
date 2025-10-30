
'use server';
/**
 * @fileOverview A flow for generating explanations for quiz questions.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { GenerateExplanationInputSchema, GenerateExplanationOutputSchema, GenerateExplanationInput, GenerateExplanationOutput, PracticeQuestionSchema } from '@/ai/schemas/quiz-explanation-schema';

const prompt = ai.definePrompt({
    name: 'quizExplanationPrompt',
    model: googleAI.model('gemini-2.0-flash'),
    input: { schema: GenerateExplanationInputSchema },
    output: { schema: GenerateExplanationOutputSchema },
    prompt: `You are an expert tutor. A student has answered a quiz question incorrectly. 
    
    **CRITICAL**: For any mathematical expressions, especially exponents, use proper notation. For example, use 'x²' instead of 'x^2'.

    Your task depends on whether you are being asked to provide a full explanation or just a new question.

    {{#if provideFullExplanation}}
    Your tasks are:
    1. Provide a clear, encouraging, and helpful explanation (2-3 sentences).
    2. Generate a brand new, similar multiple-choice practice question to test their understanding.
    {{else}}
    The student answered your last practice question incorrectly. Your ONLY task is to generate another brand new, similar multiple-choice practice question that tests the same concept but uses a different scenario. DO NOT provide any explanation text.
    {{/if}}

    The user's learning style is {{learnerType}}. Tailor your explanation (if providing one) and question accordingly:
    - For Visual learners, use descriptive language that helps them visualize the concept.
    - For Auditory learners, explain it as if you were speaking to them.
    - For Kinesthetic learners, relate the concept to a real-world example or a physical action.

    Original Question: "{{question}}"
    Their Incorrect Answer: "{{userAnswer}}"
    Correct Answer: "{{correctAnswer}}"

    {{#if provideFullExplanation}}
    When explaining, clarify why their answer is incorrect and how to arrive at the correct answer. Keep the tone positive and supportive.
    Then, create a new multiple-choice question that tests the same concept but uses different numbers, scenarios, or wording. Provide 4 options and the correct answer for this new question.
    {{else}}
    Just generate the new practice question, 4 options, and the correct answer.
    {{/if}}
    `,
});

const generateExplanationFlow = ai.defineFlow(
  {
    name: 'generateExplanationFlow',
    inputSchema: GenerateExplanationInputSchema,
    outputSchema: GenerateExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate explanation.');
    }
    // Ensure explanation is an empty string if not requested, as the model might still generate one.
    if (!input.provideFullExplanation) {
      output.explanation = '';
    }
    return output;
  }
);

export async function generateExplanation(input: GenerateExplanationInput): Promise<GenerateExplanationOutput> {
    return generateExplanationFlow(input);
}
