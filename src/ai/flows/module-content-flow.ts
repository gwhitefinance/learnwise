
'use server';
/**
 * @fileOverview A flow for generating all chapter content within a single course module, including multimedia assets.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateChapterContent } from './chapter-content-flow';
import { generateImage } from './image-generation-flow';
import { generateVideo } from './video-generation-flow';
import { GenerateModuleContentInputSchema, GenerateModuleContentOutputSchema, GenerateModuleContentInput, GenerateModuleContentOutput } from '@/ai/schemas/module-content-schema';

// Helper function for generating a simple unique ID
const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const generateModuleContentFlow = ai.defineFlow(
  {
    name: 'generateModuleContentFlow',
    inputSchema: GenerateModuleContentInputSchema,
    outputSchema: GenerateModuleContentOutputSchema,
  },
  async (input) => {
    
    // 1. Generate all chapter text content and multimedia prompts in parallel
    const chapterContentPromises = input.module.chapters.map(chapter => 
      generateChapterContent({
        courseName: input.courseName,
        moduleTitle: input.module.title,
        chapterTitle: chapter.title,
        learnerType: input.learnerType,
      })
    );
    const allChapterData = await Promise.all(chapterContentPromises);

    // 2. Trigger all image and video generations in parallel
    const mediaGenerationPromises = allChapterData.flatMap(data => [
        data.imagePrompt ? generateImage({ prompt: data.imagePrompt }) : Promise.resolve({ media: '' }),
        data.diagramPrompt ? generateImage({ prompt: data.diagramPrompt }) : Promise.resolve({ media: '' }),
        data.videoPrompt ? generateVideo({ prompt: data.videoPrompt }) : Promise.resolve({ media: '' }),
    ]);

    const allMediaAssets = await Promise.all(mediaGenerationPromises);

    // 3. Assemble the final module with all content and media URLs
    let mediaIndex = 0;
    const updatedModule = {
        id: input.module.id || generateUniqueId(),
        title: input.module.title,
        chapters: input.module.chapters.map((chapter, chapterIndex) => {
            const contentData = allChapterData[chapterIndex];
            const imageUrl = allMediaAssets[mediaIndex++]?.media;
            const diagramUrl = allMediaAssets[mediaIndex++]?.media;
            const videoUrl = allMediaAssets[mediaIndex++]?.media;

            return {
                id: chapter.id || generateUniqueId(),
                title: chapter.title,
                content: contentData.content,
                activity: contentData.activity,
                imageUrl: imageUrl,
                diagramUrl: diagramUrl,
                videoUrl: videoUrl,
            };
        })
    };

    return {
      updatedModule,
    };
  }
);


export async function generateModuleContent(input: GenerateModuleContentInput): Promise<GenerateModuleContentOutput> {
    return generateModuleContentFlow(input);
}
