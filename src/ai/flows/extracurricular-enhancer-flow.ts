
'use server';
/**
 * @fileOverview An AI flow to enhance descriptions of extracurricular activities for college applications.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { EnhanceExtracurricularInputSchema, EnhanceExtracurricularOutputSchema, EnhanceExtracurricularInput, EnhanceExtracurricularOutput } from '@/ai/schemas/extracurricular-enhancer-schema';

const prompt = ai.definePrompt({
    name: 'extracurricularEnhancerPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: EnhanceExtracurricularInputSchema },
    output: { schema: EnhanceExtracurricularOutputSchema },
    prompt: `You are an expert college admissions consultant. Your task is to take a student's description of an extracurricular activity and make it sound more professional and impactful for a college application. You will also provide a strength score.

    User's Description: "{{activityDescription}}"

    **Instructions**:
    1.  **Rephrase for Impact**: Rewrite the description to be concise yet powerful. Use action verbs and quantify achievements where possible. Focus on demonstrating leadership, initiative, skill development, and impact. Do not lie or invent details, but polish the existing information to highlight its strengths.
    2.  **Calculate Strength Score**: Based on the description, estimate a "strength score" from 0 to 100. This score reflects the activity's potential impact on a college application.
        -   **Low score (0-40)**: Minimal involvement, no leadership or clear impact. (e.g., "Member of a club")
        -   **Medium score (41-70)**: Consistent participation, some skill development. (e.g., "Active member of debate club for 2 years")
        -   **High score (71-90)**: Significant achievement, leadership role, or clear impact. (e.g., "Captain of the debate team, won regional championship")
        -   **Exceptional score (91-100)**: Major leadership, founded an organization, won national awards, significant community impact. (e.g., "Founded a non-profit that taught coding to 50+ underprivileged students")

    Generate the enhanced description and the strength score.
    `,
});

const enhanceExtracurricularFlow = ai.defineFlow(
  {
    name: 'enhanceExtracurricularFlow',
    inputSchema: EnhanceExtracurricularInputSchema,
    outputSchema: EnhanceExtracurricularOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to enhance activity.');
    }
    return output;
  }
);

export async function enhanceExtracurricular(input: EnhanceExtracurricularInput): Promise<EnhanceExtracurricularOutput> {
    return enhanceExtracurricularFlow(input);
}
