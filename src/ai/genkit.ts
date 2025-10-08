
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {mistral} from '@genkit-ai/mistral';

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

if (process.env.MISTRAL_API_KEY) {
  plugins.push(mistral({ apiKey: process.env.MISTRAL_API_KEY }));
} else {
  console.warn(
    'MISTRAL_API_KEY environment variable not set. Genkit will not be able to use Mistral models.'
  );
}

export const ai = genkit({
  plugins,
});

export { googleAI };
