
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateQuizToolInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numQuestions: z.number().optional().default(5).describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().describe('The difficulty level of the quiz.'),
});

// The tool now returns the parameters, not the full quiz.
const GenerateQuizToolOutputSchema = GenerateQuizToolInputSchema;


export const generateQuizTool = ai.defineTool(
  {
    name: 'generateQuizTool',
    description: 'Generates a practice quiz on a given topic.',
    inputSchema: GenerateQuizToolInputSchema,
    outputSchema: GenerateQuizToolOutputSchema,
  },
  async (input) => {
    // The tool's job is just to confirm the parameters.
    // The actual quiz generation will happen on the client when the user clicks "Open".
    return {
      topic: input.topic,
      numQuestions: input.numQuestions,
      difficulty: input.difficulty || 'Medium',
    };
  }
);
