
'use server';
/**
 * @fileOverview A "master" flow to generate all content for a course and an updated roadmap.
 */
import { ai, googleAI } from '@/ai/genkit';
import { z } from 'zod';
import { generateChapterContent, GenerateChapterContentInput } from './chapter-content-flow';
import { generateRoadmap, GenerateRoadmapInput } from './roadmap-flow';

const ChapterOutlineSchema = z.object({
  title: z.string(),
});
const ModuleOutlineSchema = z.object({
  title: z.string(),
  chapters: z.array(ChapterOutlineSchema),
});

export const GenerateFullCourseContentInputSchema = z.object({
  courseName: z.string(),
  courseOutline: z.array(ModuleOutlineSchema),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
  durationInMonths: z.number(),
});
export type GenerateFullCourseContentInput = z.infer<typeof GenerateFullCourseContentInputSchema>;

const ChapterSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    activity: z.string(),
});
const ModuleSchema = z.object({
    id: z.string(),
    title: z.string(),
    chapters: z.array(ChapterSchema),
});
const GoalSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    icon: z.string(),
});
const MilestoneSchema = z.object({
    id: z.string(),
    date: z.string(),
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    completed: z.boolean(),
});

export const GenerateFullCourseContentOutputSchema = z.object({
  updatedUnits: z.array(ModuleSchema),
  newRoadmap: z.object({
    goals: z.array(GoalSchema),
    milestones: z.array(MilestoneSchema),
  }),
});
export type GenerateFullCourseContentOutput = z.infer<typeof GenerateFullCourseContentOutputSchema>;


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
        id: crypto.randomUUID(),
        title: module.title,
        chapters: module.chapters.map(chapter => {
            const content = allChapterContents[contentIndex++];
            return {
                id: crypto.randomUUID(),
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
        goals: roadmapResult.goals.map(g => ({ ...g, id: crypto.randomUUID(), icon: g.icon || 'Flag' })),
        milestones: roadmapResult.milestones.map(m => ({ ...m, id: crypto.randomUUID(), icon: m.icon || 'Calendar', completed: false }))
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
