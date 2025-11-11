
'use server';
/**
 * @fileOverview An AI flow to grade student assignments.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GradeAssignmentInputSchema, GradeAssignmentOutputSchema, type GradeAssignmentInput, type GradeAssignmentOutput } from '@/ai/schemas/assignment-grader-schema';

const prompt = ai.definePrompt({
    name: 'gradeAssignmentPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GradeAssignmentInputSchema },
    output: { schema: GradeAssignmentOutputSchema },
    prompt: `You are an expert AI teaching assistant. Your task is to grade a student's assignment based on the provided content and rubric.

    **Rubric/Instructions**:
    {{#if rubric}}
    {{rubric}}
    {{else}}
    Please use a standard academic rubric for this type of assignment. Assess for clarity, accuracy, depth of understanding, and quality of writing.
    {{/if}}

    **Student's Assignment**:
    '''
    {{assignment}}
    '''

    **Your Task**:
    1.  **Score**: Provide an integer score from 0 to 100 based on your assessment.
    2.  **Strengths**: Identify 2-3 specific things the student did well. Be positive and encouraging.
    3.  **Improvements**: Identify 2-3 specific, actionable areas for improvement. Be constructive and clear.
    4.  **Final Verdict**: Write a single, concise sentence that summarizes the overall quality of the work.

    Provide a fair and balanced evaluation to help the student learn.
    `,
});

const gradeAssignmentFlow = ai.defineFlow(
  {
    name: 'gradeAssignmentFlow',
    inputSchema: GradeAssignmentInputSchema,
    outputSchema: GradeAssignmentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to grade assignment.');
    }
    return output;
  }
);

export async function generateAssignmentGrade(input: GradeAssignmentInput): Promise<GradeAssignmentOutput> {
    return gradeAssignmentFlow(input);
}
