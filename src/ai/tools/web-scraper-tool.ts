
'use server';
/**
 * @fileOverview A Genkit tool for scraping text content from a webpage.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { JSDOM } from 'jsdom';

const WebScraperInputSchema = z.object({
    url: z.string().url().describe('The URL of the webpage to scrape.'),
});

export const scrapeWebpageTool = ai.defineTool(
    {
        name: 'scrapeWebpageTool',
        description: 'Fetches and returns the text content of a given webpage URL. Use this to get context from course pages.',
        inputSchema: WebScraperInputSchema,
        outputSchema: z.string(),
    },
    async ({ url }) => {
        console.log(`Scraping text content from: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch page: ${response.statusText}`);
            }
            const html = await response.text();
            const dom = new JSDOM(html);
            const document = dom.window.document;

            // Remove script and style elements
            document.querySelectorAll('script, style').forEach(elem => elem.remove());

            // Get text from the body, preferring main content if possible
            const mainContent = document.querySelector('main') || document.querySelector('article') || document.body;
            
            // A simple way to get clean text. A more advanced version might
            // selectively pull from h1, h2, p, etc. and join them.
            const textContent = mainContent.textContent || "";

            // Simple text cleanup
            const cleanedText = textContent.replace(/\s\s+/g, ' ').trim();
            
            return cleanedText.slice(0, 50000); // Limit content length to avoid overly large inputs
        } catch (error) {
            console.error(`Error scraping ${url}:`, error);
            // Return a meaningful error message or an empty string
            if (error instanceof Error) {
                return `Failed to scrape content from the URL. Reason: ${error.message}`;
            }
            return 'Failed to scrape content from the URL.';
        }
    }
);
