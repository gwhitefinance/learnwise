
import { z } from 'zod';
import { GenerateRoadmapInputSchema as RoadmapInputSchema } from './roadmap-schema';

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

export type GenerateRoadmapInput = z.infer<typeof RoadmapInputSchema>;

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
