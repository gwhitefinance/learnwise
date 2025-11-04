
'use server';
/**
 * @fileOverview An AI flow to generate a checklist of what colleges consider for admissions.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { CollegeChecklistInputSchema, CollegeChecklistOutputSchema } from '@/ai/schemas/college-checklist-schema';

const prompt = ai.definePrompt({
    name: 'collegeChecklistPrompt',
    model: googleAI.model('gemini-2.0-flash'),
    input: { schema: CollegeChecklistInputSchema },
    output: { schema: CollegeChecklistOutputSchema },
    prompt: `You are an expert college admissions consultant. Your task is to generate a prioritized checklist of admission factors for a specific university based on its profile.

    University Name: "{{collegeName}}"
    Acceptance Rate: {{#if acceptanceRate}}{{acceptanceRate}}{{else}}N/A{{/if}}
    Average SAT: {{#if satScore}}{{satScore}}{{else}}N
A{{/if}}

    **Instructions**:
    1.  **Analyze Selectivity**: Use the acceptance rate and SAT score to gauge the selectivity of the school (e.g., highly selective, selective, less selective).
    2.  **Generate Checklist**: Create a list of common admission factors. For each factor, determine its importance level ('Very Important', 'Considered', or 'Not Considered') based on the school's selectivity.
    3.  **Prioritization Logic**:
        -   **Highly Selective Schools** (e.g., Ivy Leagues, top-tier universities with low acceptance rates): 'Rigor of secondary school record', 'GPA', 'Test Scores', 'Essays', and 'Recommendations' are almost always 'Very Important'. Character/Personal Qualities are also very important.
        -   **Selective Schools**: 'Rigor', 'GPA', and 'Test Scores' are 'Very Important'. 'Essays' and 'Recommendations' are 'Considered'.
        -   **Less Selective Schools**: 'GPA' and 'Rigor' are 'Very Important' or 'Considered'. 'Test Scores' are often 'Considered' (and sometimes optional). Other factors are less critical.
    4.  **Factors to Include**: Your checklist MUST include the following factors:
        - Rigor of secondary school record
        - Class Rank
        - Academic GPA
        - Standardized Test Scores
        - Application Essay
        - Recommendation(s)
        - Interview
        - Extracurricular Activities
        - Talent/Ability
        - Character/Personal Qualities
        - First generation
        - State Residency
        - Work Experience

    Generate the checklist with the appropriate importance level for each factor.
    `,
});

const generateCollegeChecklistFlow = ai.defineFlow(
  {
    name: 'generateCollegeChecklistFlow',
    inputSchema: CollegeChecklistInputSchema,
    outputSchema: CollegeChecklistOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate college checklist.');
    }
    return output;
  }
);

export async function generateCollegeChecklist(input: z.infer<typeof CollegeChecklistInputSchema>): Promise<z.infer<typeof CollegeChecklistOutputSchema>> {
    return generateCollegeChecklistFlow(input);
}
