
import { z } from 'zod';

export const generateVideoInputSchema = z.object({
  courseName: z.string().describe('The name of the overall course.'),
  episodeTitle: z.string().describe('The title of this specific episode (unit).'),
  episodeContent: z.string().describe('The text content for this episode to be converted into a podcast script.'),
});
export type GenerateVideoInput = z.infer<typeof generateVideoInputSchema>;

export const generateVideoOutputSchema = z.object({
  script: z.string().describe('The generated podcast script, formatted for conversational delivery.'),
  videoUrl: z.string().url().describe('The data URI of the generated video.'),
});
export type GenerateVideoOutput = z.infer<typeof generateVideoOutputSchema>;
