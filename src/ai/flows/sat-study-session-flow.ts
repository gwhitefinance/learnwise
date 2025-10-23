
'use server';
/**
 * @fileOverview A flow for generating a 10-question, high-difficulty SAT study session.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { SatStudySessionInputSchema, SatStudySessionOutputSchema, type SatStudySessionInput, type SatStudySessionOutput } from '@/ai/schemas/sat-study-session-schema';


const prompt = ai.definePrompt({
    name: 'satStudySessionPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: SatStudySessionInputSchema },
    output: { schema: SatStudySessionOutputSchema },
    prompt: `You are an expert SAT test creator. Your task is to generate a 10-question, high-difficulty, SAT-level practice study session.

    - The session should focus exclusively on the requested category: {{category}}.
    
    **CRITICAL INSTRUCTIONS for 'Reading & Writing' Category:**
    1.  **Diverse Topics**: You MUST generate questions that cover the full spectrum of the SAT Reading and Writing test. Distribute the 10 questions across these four domains:
        -   **Craft and Structure** (~3 questions): Focus on words in context, text structure, purpose, and cross-text connections.
        -   **Information and Ideas** (~3 questions): Focus on central ideas, details, command of evidence (textual and quantitative), and inference.
        -   **Expression of Ideas** (~2 questions): Focus on rhetorical synthesis and transitions.
        -   **Standard English Conventions** (~2 questions): Focus on boundaries (punctuation), and form, structure, and sense.
    2.  **Passages are Mandatory**: For EVERY 'Reading & Writing' question, you MUST include a relevant, concise passage (a few sentences to a short paragraph) that provides the necessary context to answer the question.
    3.  **Complete Data**: Ensure every field (difficulty, topic, subTopic, question, options, correctAnswer, explanation) is fully populated for every question. Do not return "N/A" or leave any field blank.

    **CRITICAL INSTRUCTIONS for 'Math' Category:**
    1.  **Diverse Topics**: You MUST generate questions that cover the full spectrum of the SAT Math test. Distribute the 10 questions across these four domains:
        -   **Algebra** (~3 questions)
        -   **Advanced Math** (~3 questions)
        -   **Problem-Solving and Data Analysis** (~2 questions)
        -   **Geometry and Trigonometry** (~2 questions)
    2.  **Varied Question Types**: You MUST generate a mix of question formats. Create ~7-8 multiple-choice questions (with four options: A, B, C, D) and ~2-3 student-produced response (grid-in) questions. For grid-in questions, the 'options' array should be empty.
    3.  **Complete Data**: Ensure every field (difficulty, topic, subTopic, question, options, correctAnswer, explanation) is fully populated for every question. Do not return "N/A" or leave any field blank.

    For each of the 10 questions, provide:
    - A 'difficulty' ('Easy', 'Medium', or 'Hard').
    - A main 'topic' from one of the four domains listed above.
    - A specific 'subTopic' (e.g., 'Words in Context', 'Linear Equations').
    - The question text.
    - An array of four multiple-choice options (or an empty array for grid-in questions).
    - The correct answer.
    - A clear, concise explanation for why the correct answer is correct, tailored to a {{learnerType}} learner.
    `,
});


export const generateSatStudySessionFlow = ai.defineFlow(
  {
    name: 'generateSatStudySessionFlow',
    inputSchema: SatStudySessionInputSchema,
    outputSchema: SatStudySessionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate SAT study session.');
    }
    return output;
  }
);

export async function generateSatStudySessionAction(input: SatStudySessionInput): Promise<SatStudySessionOutput> {
    return generateSatStudySessionFlow(input);
}
