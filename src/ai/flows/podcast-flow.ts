
'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { GeneratePodcastInput, GeneratePodcastInputSchema } from '@/ai/schemas/podcast-schema';
import { generateAudio } from './text-to-speech-flow';
import { z } from 'zod';

const podcastScriptSchema = z.object({
  script: z.string().describe('The generated podcast script, formatted for conversational delivery.'),
});

const podcastPrompt = ai.definePrompt({
    name: 'podcastGenerationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GeneratePodcastInputSchema },
    output: { schema: podcastScriptSchema },
    prompt: `You are an engaging podcast host named "AI Buddy". Your task is to convert the following educational material into a conversational and informative podcast script.

    Course Name: {{courseName}}
    Desired Duration: {{duration}} minutes
    
    Content to transform:
    "{{content}}"

    Instructions:
    1.  **Introduction**: Start with a catchy intro, introducing yourself and the topic.
    2.  **Conversational Tone**: Rewrite the content in a natural, spoken-word format. Use questions, rhetorical devices, and a friendly tone. Avoid just reading the text.
    3.  **Structure**: Break the content down into logical segments. Use transitions to move smoothly between topics.
    4.  **Duration**: Adjust the level of detail to fit the desired duration. For shorter durations, focus on key concepts and summaries. For longer durations, include more detailed explanations, examples, and analogies.
    5.  **Outro**: End with a brief summary and a friendly sign-off.
    
    Generate only the script for the podcast.
    `,
});

const generatePodcastFlow = ai.defineFlow(
    {
        name: 'generatePodcastFlow',
        inputSchema: GeneratePodcastInputSchema,
        outputSchema: z.object({
            audioDataUris: z.array(z.string()),
        }),
    },
    async (input) => {
        // 1. Generate the full script
        const { output: scriptOutput } = await podcastPrompt(input);
        if (!scriptOutput || !scriptOutput.script) {
            throw new Error('Failed to generate podcast script.');
        }

        // 2. Split the script into paragraphs (or sentences for more granularity)
        const segments = scriptOutput.script.split('\n').filter(s => s.trim() !== '');

        // 3. Generate audio for each segment in parallel
        const audioPromises = segments.map(segment => 
            generateAudio({ text: segment }).then(result => result.audioDataUri)
        );

        const audioDataUris = await Promise.all(audioPromises);
        
        return { audioDataUris };
    }
);

export async function generatePodcast(input: GeneratePodcastInput): Promise<{ audioDataUris: string[] }> {
    return generatePodcastFlow(input);
}
