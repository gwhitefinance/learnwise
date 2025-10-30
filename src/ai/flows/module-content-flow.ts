
'use server';
/**
 * @fileOverview A flow for generating all chapter content within a single course module.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateChapterContent } from './chapter-content-flow';
import { GenerateModuleContentInputSchema, GenerateModuleContentOutputSchema, GenerateModuleContentInput, GenerateModuleContentOutput, ChapterWithContent } from '@/ai/schemas/module-content-schema';

// Helper function for generating a simple unique ID
const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const generateModuleContentFlow = ai.defineFlow(
  {
    name: 'generateModuleContentFlow',
    inputSchema: GenerateModuleContentInputSchema,
    outputSchema: GenerateModuleContentOutputSchema,
  },
  async (input) => {
    
    // Concurrently generate content for all chapters
    const contentGenerationPromises = input.module.chapters.map(chapter =>
        generateChapterContent({
            courseName: input.courseName,
            moduleTitle: input.module.title,
            chapterTitle: chapter.title,
            learnerType: input.learnerType,
        })
    );

    const generatedContents = await Promise.all(contentGenerationPromises);
    
    // Assemble the full chapter data with the generated content
    const updatedChapters: ChapterWithContent[] = input.module.chapters.map((chapter, index) => {
        const contentData = generatedContents[index];
        return {
            id: chapter.id || generateUniqueId(),
            title: chapter.title,
            content: JSON.stringify(contentData.content),
            activity: JSON.stringify(contentData.activity),
        };
    });

    // Assemble the final module with all content
    const updatedModule = {
        id: input.module.id || generateUniqueId(),
        title: input.module.title,
        chapters: updatedChapters,
    };

    return {
      updatedModule,
    };
  }
);


export async function generateModuleContent(input: GenerateModuleContentInput): Promise<GenerateModuleContentOutput> {
    return generateModuleContentFlow(input);
}
