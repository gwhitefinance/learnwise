
import { z } from 'zod';

export const generateVideoInputSchema = z.object({
  episodeContent: z.string().describe('The text content for this episode to be converted into a short video.'),
});

export const generateVideoOutputSchema = z.object({
  videoUrl: z.string().url().describe('The data URI of the generated video.'),
});
