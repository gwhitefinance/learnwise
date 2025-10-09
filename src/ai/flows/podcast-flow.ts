
'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { GeneratePodcastEpisodeInput, GeneratePodcastEpisodeInputSchema, GeneratePodcastEpisodeOutput, GeneratePodcastEpisodeOutputSchema } from '@/ai/schemas/podcast-schema';
import { generateAudio } from './text-to-speech-flow';
import { z } from 'zod';

const podcastScriptSchema = z.object({
  script: z.string().describe('The generated podcast script, formatted for conversational delivery.'),
});

const podcastPrompt = ai.definePrompt({
    name: 'podcastEpisodeGenerationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GeneratePodcastEpisodeInputSchema },
    output: { schema: podcastScriptSchema },
    prompt: `You are an engaging podcast host named "AI Buddy". Your task is to convert the following educational material into a single, conversational, and informative podcast episode.

    Course Name: {{courseName}}
    Episode Title: {{episodeTitle}}
    
    Content to transform:
    "{{episodeContent}}"

    Instructions:
    1.  **Introduction**: Start with a catchy intro, introducing yourself, the main course topic, and this specific episode's title.
    2.  **Conversational Tone**: Rewrite the content in a natural, spoken-word format. Use questions, rhetorical devices, and a friendly tone. Avoid just reading the text.
    3.  **Structure**: Break the content down into logical segments. Use transitions to move smoothly between topics.
    4.  **Outro**: End with a brief summary of the episode and a friendly sign-off, perhaps teasing the next topic.
    
    Generate only the script for this single podcast episode.
    `,
});

const generatePodcastEpisodeFlow = ai.defineFlow(
    {
        name: 'generatePodcastEpisodeFlow',
        inputSchema: GeneratePodcastEpisodeInputSchema,
        outputSchema: GeneratePodcastEpisodeOutputSchema,
    },
    async (input) => {
        // 1. Generate the full script for the episode
        const { output: scriptOutput } = await podcastPrompt(input);
        if (!scriptOutput || !scriptOutput.script) {
            throw new Error('Failed to generate podcast script.');
        }

        // 2. Split the script into paragraphs to generate audio in chunks
        const segments = scriptOutput.script.split('\n').filter(s => s.trim() !== '');

        // 3. Generate audio for each segment in parallel
        const audioPromises = segments.map(segment => 
            generateAudio({ text: segment }).then(result => result.audioDataUri)
        );

        const audioDataUris = await Promise.all(audioPromises);
        
        return { audioDataUris };
    }
);

export async function generatePodcastEpisode(input: GeneratePodcastEpisodeInput): Promise<GeneratePodcastEpisodeOutput> {
    return generatePodcastEpisodeFlow(input);
}
