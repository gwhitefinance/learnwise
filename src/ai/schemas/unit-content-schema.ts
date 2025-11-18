
import { z } from 'zod';

const ChapterOutlineSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
});

const UnitOutlineSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  chapters: z.array(ChapterOutlineSchema),
});

export const GenerateUnitContentInputSchema = z.object({
  courseName: z.string(),
  unit: UnitOutlineSchema,
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
});
export type GenerateUnitContentInput = z.infer<typeof GenerateUnitContentInputSchema>;


export const ChapterWithContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  activity: z.string(),
});
export type ChapterWithContent = z.infer<typeof ChapterWithContentSchema>;

const UnitSchema = z.object({
  id: z.string(),
  title: z.string(),
  chapters: z.array(ChapterWithContentSchema),
});


export const GenerateUnitContentOutputSchema = z.object({
  updatedUnit: UnitSchema,
});
export type GenerateUnitContentOutput = z.infer<typeof GenerateUnitContentOutputSchema>;
