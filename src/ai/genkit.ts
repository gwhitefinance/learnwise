
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const plugins: any[] = [];

if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI({ apiKey: process.env.GEMINI_API_KEY }));
} else {
  // This warning is helpful for local development if the key is missing.
  // On the server, App Hosting will provide the key.
  console.warn(
    'GEMINI_API_KEY environment variable not set. Genkit will not be able to use Google AI models.'
  );
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.5-flash',
});
