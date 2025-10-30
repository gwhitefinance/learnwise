
'use server';
/**
 * @fileOverview A Genkit tool for fetching YouTube video transcripts.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const YouTubeTranscriptInputSchema = z.object({
    url: z.string().url().describe('The URL of the YouTube video.'),
});

// A more robust XML parser to extract text from the transcript
const parseTranscript = (xml: string): string => {
    try {
        // Use a regular expression to find all content within <text>...</text> tags
        const textNodes = xml.match(/<text[^>]*>(.*?)<\/text>/g) || [];
        return textNodes
            .map(node => {
                // Remove the tags themselves, leaving only the inner content
                const innerText = node.replace(/<[^>]+>/g, '');
                // Decode HTML entities like &#39; and &quot;
                return innerText
                    .replace(/&amp;#39;/g, "'")
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .trim();
            })
            .filter(text => text.length > 0)
            .join(' ');
    } catch (e) {
        console.error("XML parsing failed", e);
        return "Could not parse transcript.";
    }
};

export const getYouTubeTranscript = ai.defineTool(
    {
        name: 'getYouTubeTranscript',
        description: 'Fetches the transcript for a given YouTube video URL. Use this specifically for YouTube links.',
        inputSchema: YouTubeTranscriptInputSchema,
        outputSchema: z.string(),
    },
    async ({ url }) => {
        console.log(`Fetching transcript for YouTube URL: ${url}`);
        try {
            const videoIdMatch = url.match(/(?:v=)([\w-]{11})/);
            if (!videoIdMatch) {
                return 'Error: Invalid YouTube URL. Could not find video ID.';
            }
            const videoId = videoIdMatch[1];
            
            // First, get the page to find the captions URL
            const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
            const pageHtml = await response.text();

            const captionsUrlMatch = pageHtml.match(/"captionTracks":\[\{"baseUrl":"([^"]+)/);
            if (!captionsUrlMatch) {
                return "Error: Could not find captions for this video. Please ensure captions are enabled.";
            }

            let transcriptUrl = captionsUrlMatch[1];
            // The URL from the page HTML is JSON-escaped, so we need to unescape it.
            transcriptUrl = transcriptUrl.replace(/\\u0026/g, '&');
            
            // Fetch the actual transcript XML
            const transcriptResponse = await fetch(transcriptUrl);
            if (!transcriptResponse.ok) {
                return 'Error: Failed to fetch transcript data.';
            }
            const transcriptXml = await transcriptResponse.text();

            // Parse the XML to plain text
            const plainText = parseTranscript(transcriptXml);
            
            if (!plainText.trim()) {
                return "Error: Transcript is empty or could not be parsed.";
            }

            return plainText.slice(0, 50000); 

        } catch (error) {
            console.error(`Error fetching YouTube transcript for ${url}:`, error);
            if (error instanceof Error) {
                return `Error: Failed to fetch transcript. Reason: ${error.message}`;
            }
            return 'Error: An unknown error occurred while fetching the transcript.';
        }
    }
);
