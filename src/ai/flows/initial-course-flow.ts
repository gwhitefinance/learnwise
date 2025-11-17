
'use server';
/**
 * @fileOverview A flow for generating a full course outline, content for the first chapter, and a study roadmap.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateMiniCourse } from './mini-course-flow';
import { generateChapterContent } from './chapter-content-flow';
import { generateRoadmap } from './roadmap-flow';
import { GenerateMiniCourseInputSchema, GenerateMiniCourseOutputSchema } from '@/ai/schemas/mini-course-schema';
import { GenerateRoadmapOutputSchema } from '@/ai/schemas/roadmap-schema';
import { GenerateChapterContentOutputSchema } from '@/ai/schemas/chapter-content-schema';

const InitialCourseInputSchema = GenerateMiniCourseInputSchema.extend({
    durationInMonths: z.number().optional().default(3),
});
export type InitialCourseInput = z.infer<typeof InitialCourseInputSchema>;

const InitialCourseOutputSchema = z.object({
    courseOutline: GenerateMiniCourseOutputSchema,
    firstChapterContent: GenerateChapterContentOutputSchema,
    roadmap: GenerateRoadmapOutputSchema,
});
export type InitialCourseOutput = z.infer<typeof InitialCourseOutputSchema>;


const generateInitialCourseAndRoadmapFlow = ai.defineFlow(
  {
    name: 'generateInitialCourseAndRoadmapFlow',
    inputSchema: InitialCourseInputSchema,
    outputSchema: InitialCourseOutputSchema,
  },
  async (input) => {
    // 1. Generate the course outline and key concepts
    const courseOutline = await generateMiniCourse({
      courseName: input.courseName,
      courseDescription: input.courseDescription,
      learnerType: input.learnerType,
    });

    if (!courseOutline.modules || courseOutline.modules.length === 0 || !courseOutline.modules[0].chapters || courseOutline.modules[0].chapters.length === 0) {
      throw new Error('Failed to generate a valid course outline.');
    }

    // 2. Generate content for the first chapter
    const firstModule = courseOutline.modules[0];
    const firstChapter = firstModule.chapters[0];
    const firstChapterContent = await generateChapterContent({
      courseName: input.courseName,
      moduleTitle: firstModule.title,
      chapterTitle: firstChapter.title,
      learnerType: input.learnerType,
    });

    // 3. Generate the roadmap
    const roadmap = await generateRoadmap({
      courseName: input.courseName,
      courseDescription: input.courseDescription,
      durationInMonths: input.durationInMonths,
    });
    
    return {
      courseOutline,
      firstChapterContent,
      roadmap,
    };
  }
);


export async function generateInitialCourseAndRoadmap(input: InitialCourseInput): Promise<InitialCourseOutput> {
  return generateInitialCourseAndRoadmapFlow(input);
}
