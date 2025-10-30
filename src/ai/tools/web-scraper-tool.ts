
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
        description: 'Fetches and returns the text content of a given webpage URL. Use this to get context from course pages, articles, or video transcripts.',
        inputSchema: WebScraperInputSchema,
        outputSchema: z.string(),
    },
    async ({ url }) => {
        console.log(`Scraping text content from: ${url}`);
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch page: ${response.statusText}`);
            }

            const html = await response.text();
            const dom = new JSDOM(html);
            const document = dom.window.document;

            // Remove script, style, nav, footer, and header elements to reduce noise
            document.querySelectorAll('script, style, nav, footer, header, noscript, [aria-hidden="true"]').forEach(elem => elem.remove());
            
            // Try to find the main content of the page
            let mainContent = document.querySelector('main') 
                || document.querySelector('article') 
                || document.querySelector('[role="main"]') 
                || document.querySelector('#content') 
                || document.querySelector('#main-content')
                || document.body;

            // A simple way to get clean text. A more advanced version might
            // selectively pull from h1, h2, p, etc. and join them.
            const textContent = mainContent.textContent || "";

            // Simple text cleanup: remove multiple newlines and spaces
            const cleanedText = textContent
                .replace(/(\r\n|\n|\r)/gm, "\n") // Standardize newlines
                .replace(/\n\s*\n/g, '\n\n')      // Replace multiple newlines with one
                .replace(/  +/g, ' ')            // Replace multiple spaces with one
                .trim();
            
            // Limit content length to avoid overly large inputs
            return cleanedText.slice(0, 50000); 
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

