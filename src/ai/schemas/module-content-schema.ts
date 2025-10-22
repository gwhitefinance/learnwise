import { z } from 'zod';

const ChapterOutlineSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
});

const ModuleOutlineSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  chapters: z.array(ChapterOutlineSchema),
});

export const GenerateModuleContentInputSchema = z.object({
  courseName: z.string(),
  module: ModuleOutlineSchema,
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateModuleContentInput = z.infer<typeof GenerateModuleContentInputSchema>;


export const ChapterWithContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  activity: z.string(),
  imageUrl: z.string().optional(),
  diagramUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});
export type ChapterWithContent = z.infer<typeof ChapterWithContentSchema>;

const ModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  chapters: z.array(ChapterWithContentSchema),
});


export const GenerateModuleContentOutputSchema = z.object({
  updatedModule: ModuleSchema,
});
export type GenerateModuleContentOutput = z.infer<typeof GenerateModuleContentOutputSchema>;
