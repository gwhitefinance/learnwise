
'use server';
/**
 * @fileOverview A flow for generating all chapter content within a single course module, including multimedia assets.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateChapterContent } from './chapter-content-flow';
import { generateImage } from './image-generation-flow';
import { generateVideo } from './video-generation-flow';
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
    
    const updatedChapters: ChapterWithContent[] = [];

    // Process chapters sequentially to avoid hitting rate limits.
    for (const chapter of input.module.chapters) {
        // 1. Generate text content and media prompts for the current chapter.
        const contentData = await generateChapterContent({
            courseName: input.courseName,
            moduleTitle: input.module.title,
            chapterTitle: chapter.title,
            learnerType: input.learnerType,
        });

        // 2. Generate media assets for the current chapter sequentially.
        const imageUrl = contentData.imagePrompt ? (await generateImage({ prompt: contentData.imagePrompt })).media : '';
        const diagramUrl = contentData.diagramPrompt ? (await generateImage({ prompt: contentData.diagramPrompt })).media : '';
        const videoUrl = contentData.videoPrompt ? (await generateVideo({ prompt: contentData.videoPrompt })).media : '';

        // 3. Assemble the full chapter data.
        updatedChapters.push({
            id: chapter.id || generateUniqueId(),
            title: chapter.title,
            content: contentData.content,
            activity: contentData.activity,
            imageUrl: imageUrl,
            diagramUrl: diagramUrl,
            videoUrl: videoUrl,
        });
    }

    // 4. Assemble the final module with all content.
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
