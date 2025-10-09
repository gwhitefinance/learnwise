
'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { GeneratePodcastInput, GeneratePodcastInputSchema, GeneratePodcastOutput, GeneratePodcastOutputSchema } from '@/ai/schemas/podcast-schema';
import { generateAudio } from './text-to-speech-flow';
import { z } from 'zod';

const podcastPrompt = ai.definePrompt({
    name: 'podcastGenerationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: GeneratePodcastInputSchema },
    output: { schema: GeneratePodcastOutputSchema },
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
            audioDataUri: z.string(),
        }),
    },
    async (input) => {
        const { output: scriptOutput } = await podcastPrompt(input);
        if (!scriptOutput) {
            throw new Error('Failed to generate podcast script.');
        }

        const { audioDataUri } = await generateAudio({ text: scriptOutput.script });

        return { audioDataUri };
    }
);

export async function generatePodcast(input: GeneratePodcastInput): Promise<{ audioDataUri: string }> {
    return generatePodcastFlow(input);
}
