
'use server';
/**
 * @fileOverview An AI flow to generate a description for a college.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { CollegeDescriptionInputSchema, CollegeDescriptionOutputSchema, CollegeDescriptionInput, CollegeDescriptionOutput } from '@/ai/schemas/college-description-schema';


const prompt = ai.definePrompt({
    name: 'collegeDescriptionPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: CollegeDescriptionInputSchema },
    output: { schema: CollegeDescriptionOutputSchema },
    prompt: `You are an expert college admissions consultant. Your task is to write a brief, engaging "About" section for a specific university.

    University Name: "{{collegeName}}"

    **Instructions**:
    1.  **Be Concise and Engaging**: Write a short paragraph (3-5 sentences) that captures the essence of the university.
    2.  **Highlight Key Characteristics**: Mention key aspects like its reputation (e.g., Ivy League, public research university), location, notable programs, or student life.
    3.  **Positive Tone**: Maintain a positive and informative tone, as if you were encouraging a student to consider the school.
    4.  **No Placeholder Text**: Do not say "Detailed description coming soon" or anything similar. Generate a real description based on the university's name.

    Generate the description.
    `,
});

const generateCollegeDescriptionFlow = ai.defineFlow(
  {
    name: 'generateCollegeDescriptionFlow',
    inputSchema: CollegeDescriptionInputSchema,
    outputSchema: CollegeDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate college description.');
    }
    return output;
  }
);

export async function generateCollegeDescription(input: CollegeDescriptionInput): Promise<CollegeDescriptionOutput> {
    return generateCollegeDescriptionFlow(input);
}
