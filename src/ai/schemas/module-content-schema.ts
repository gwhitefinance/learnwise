
import { z } from 'zod';
import { ChapterWithContentSchema as ChapterWithContent } from './unit-content-schema'; // Re-use from unit

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


export { ChapterWithContent };

const ModuleWithContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  chapters: z.array(ChapterWithContent),
});


export const GenerateModuleContentOutputSchema = z.object({
  updatedModule: ModuleWithContentSchema,
});
export type GenerateModuleContentOutput = z.infer<typeof GenerateModuleContentOutputSchema>;
