
'use server';
/**
 * @fileOverview A flow for generating a personalized mini-course structure.
 *
 * - generateMiniCourse - A function that generates a course with modules and chapters based on learner type.
 */
import { ai } from '@/ai/genkit';
import { GenerateMiniCourseInputSchema, GenerateMiniCourseOutputSchema, GenerateMiniCourseInput, GenerateMiniCourseOutput } from '@/ai/schemas/mini-course-schema';

const prompt = ai.definePrompt({
    name: 'miniCourseGenerationPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GenerateMiniCourseInputSchema },
    output: { schema: GenerateMiniCourseOutputSchema },
    prompt: `You are an expert instructional designer who creates engaging, personalized, and in-depth course outlines. 

    Your main task is to generate a complete, multi-module course outline based on the user's details.
    
    The user has provided a specific course name and description. Use these directly.
    - Course Name: {{courseName}}
    - Course Description: {{courseDescription}}

    **CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE:**
    1.  **Generate 5-7 modules for the course.** Each module must represent a major, distinct topic.
    2.  **For EACH of those modules, you must create 4-6 chapter titles.**
    3.  **For EACH AND EVERY chapter, you must generate detailed content.** This content MUST be the length of a detailed essay, comprising at least 5 to 7 substantial paragraphs. It must be a comprehensive, word-heavy educational resource. DO NOT provide a short summary or a few sentences.

    For each chapter, you must do the following based on the critical instructions above:
    1.  **Generate Detailed Content**:
        -   The content for each chapter MUST be a long-form, essay-length text.
        -   Tailor the content to the user's learning style, which is {{learnerType}}.
    2.  **Suggest an Activity**: Devise a creative, tailored activity that reinforces the chapter's content.
    3.  **Find an Interactive Tool (Optional)**:
        -   If the chapter covers a topic suitable for hands-on learning (e.g., circuit design, physics, coding), search for a relevant interactive simulation or tool.
        -   A great source is PhET Interactive Simulations (https://phet.colorado.edu/). If you find a suitable simulation, provide the direct embed URL (e.g., 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html').
        -   If no suitable tool is found, leave the 'interactiveTool' field as an empty string.
    `,
});


const generateMiniCourseFlow = ai.defineFlow(
  {
    name: 'generateMiniCourseFlow',
    inputSchema: GenerateMiniCourseInputSchema,
    outputSchema: GenerateMiniCourseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate mini-course outline.');
    }
    return output;
  }
);

export async function generateMiniCourse(input: GenerateMiniCourseInput): Promise<GenerateMiniCourseOutput> {
    return generateMiniCourseFlow(input);
}
