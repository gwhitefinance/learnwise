
import { z } from 'zod';

export const GeneratePodcastInputSchema = z.object({
  courseName: z.string().describe('The name of the course.'),
  content: z.string().describe('The text content to be converted into a podcast script.'),
  duration: z.number().min(1).describe('The desired length of the podcast in minutes.'),
});
export type GeneratePodcastInput = z.infer<typeof GeneratePodcastInputSchema>;

export const GeneratePodcastOutputSchema = z.object({
  script: z.string().describe('The generated podcast script, formatted for conversational delivery.'),
});
export type GeneratePodcastOutput = z.infer<typeof GeneratePodcastOutputSchema>;
