
'use server';

import { ai } from '@/ai/genkit';
import { generatePodcastScriptInputSchema, generatePodcastScriptOutputSchema, type GeneratePodcastScriptInput, type GeneratePodcastScriptOutput } from '@/ai/schemas/podcast-schema';
import { googleAI } from '@genkit-ai/google-genai';


const podcastPrompt = ai.definePrompt({
    name: 'podcastScriptGenerationPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    prompt: `You are an engaging podcast host named "AI Buddy". Your task is to convert the following educational material into a single, conversational, and informative podcast episode script.

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

const generatePodcastScriptFlow = ai.defineFlow(
    {
        name: 'generatePodcastScriptFlow',
        inputSchema: generatePodcastScriptInputSchema,
        outputSchema: generatePodcastScriptOutputSchema,
    },
    async (input) => {
        const { text } = await podcastPrompt(input);
        if (!text) {
            throw new Error('Failed to generate podcast script.');
        }
        return { script: text };
    }
);


export async function generatePodcastEpisode(input: GeneratePodcastScriptInput): Promise<GeneratePodcastScriptOutput> {
    return generatePodcastScriptFlow(input);
}
