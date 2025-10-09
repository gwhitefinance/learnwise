
import { z } from 'zod';

export const GeneratePodcastEpisodeInputSchema = z.object({
  courseName: z.string().describe('The name of the overall course.'),
  episodeTitle: z.string().describe('The title of this specific episode (unit).'),
  episodeContent: z.string().describe('The text content for this episode to be converted into a podcast script.'),
});
export type GeneratePodcastEpisodeInput = z.infer<typeof GeneratePodcastEpisodeInputSchema>;

export const GeneratePodcastEpisodeOutputSchema = z.object({
  audioDataUris: z.array(z.string()).describe('An array of data URIs for the generated audio segments of the episode.'),
});
export type GeneratePodcastEpisodeOutput = z.infer<typeof GeneratePodcastEpisodeOutputSchema>;
