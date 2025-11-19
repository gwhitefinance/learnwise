'use server';
/**
 * @fileOverview A flow for generating all chapter content within a single course unit.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateChapterContent } from './chapter-content-flow';
import { GenerateUnitContentInputSchema, GenerateUnitContentOutputSchema, GenerateUnitContentInput, GenerateUnitContentOutput, ChapterWithContent } from '@/ai/schemas/unit-content-schema';

// Helper function for generating a simple unique ID
const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const generateUnitContentFlow = ai.defineFlow(
  {
    name: 'generateUnitContentFlow',
    inputSchema: GenerateUnitContentInputSchema,
    outputSchema: GenerateUnitContentOutputSchema,
  },
  async (input) => {
    
    // Concurrently generate content for all chapters
    const contentGenerationPromises = input.unit.chapters.map(chapter =>
        generateChapterContent({
            courseName: input.courseName,
            unitTitle: input.unit.title,
            chapterTitle: chapter.title,
            learnerType: input.learnerType,
        })
    );

    const generatedContents = await Promise.all(contentGenerationPromises);
    
    // Assemble the full chapter data with the generated content
    const updatedChapters: ChapterWithContent[] = input.unit.chapters.map((chapter, index) => {
        const contentData = generatedContents[index];
        return {
            id: chapter.id || generateUniqueId(),
            title: chapter.title,
            // FIX: Cast content to 'any' to allow the object/array structure despite the schema expecting a string
            content: contentData.content as any,
            activity: contentData.activity,
        };
    });

    // Assemble the final unit with all content
    const updatedUnit = {
        id: input.unit.id || generateUniqueId(),
        title: input.unit.title,
        chapters: updatedChapters,
    };

    return {
      updatedUnit,
    };
  }
);


export async function generateUnitContent(input: GenerateUnitContentInput): Promise<GenerateUnitContentOutput> {
    return generateUnitContentFlow(input);
}