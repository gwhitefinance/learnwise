
'use server';
/**
 * @fileOverview A "master" flow to generate all content for a course and an updated roadmap.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateChapterContent } from './chapter-content-flow';
import { generateRoadmap } from './roadmap-flow';
import { GenerateFullCourseContentInputSchema, GenerateFullCourseContentOutputSchema, GenerateFullCourseContentInput, GenerateFullCourseContentOutput, GenerateRoadmapInput } from '@/ai/schemas/full-course-content-schema';

// Helper function for generating a simple unique ID
const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const generateFullCourseContentFlow = ai.defineFlow(
  {
    name: 'generateFullCourseContentFlow',
    inputSchema: GenerateFullCourseContentInputSchema,
    outputSchema: GenerateFullCourseContentOutputSchema,
  },
  async (input) => {
    
    // 1. Generate all chapter content in parallel
    const chapterContentPromises = input.courseOutline.flatMap(module =>
      module.chapters.map(chapter => 
        generateChapterContent({
          courseName: input.courseName,
          moduleTitle: module.title,
          chapterTitle: chapter.title,
          learnerType: input.learnerType,
        })
      )
    );
    const allChapterContents = await Promise.all(chapterContentPromises);

    let contentIndex = 0;
    const updatedUnits = input.courseOutline.map(module => ({
        id: generateUniqueId(),
        title: module.title,
        chapters: module.chapters.map(chapter => {
            const content = allChapterContents[contentIndex++];
            return {
                id: generateUniqueId(),
                title: chapter.title,
                content: content.content,
                activity: content.activity,
            };
        })
    }));

    // 2. Generate the roadmap
    const roadmapInput: GenerateRoadmapInput = {
        courseName: input.courseName,
        durationInMonths: input.durationInMonths,
        courseDescription: `A comprehensive course on ${input.courseName}`,
    };
    const roadmapResult = await generateRoadmap(roadmapInput);
    
    const newRoadmap = {
        goals: roadmapResult.goals.map(g => ({ ...g, id: generateUniqueId(), icon: g.icon || 'Flag' })),
        milestones: roadmapResult.milestones.map(m => ({ ...m, id: generateUniqueId(), icon: m.icon || 'Calendar', completed: false }))
    };

    return {
      updatedUnits,
      newRoadmap,
    };
  }
);


export async function generateFullCourseContent(input: GenerateFullCourseContentInput): Promise<GenerateFullCourseContentOutput> {
    return generateFullCourseContentFlow(input);
}
