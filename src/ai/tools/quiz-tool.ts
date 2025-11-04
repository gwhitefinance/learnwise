
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateQuiz } from '../flows/quiz-flow';
import { GenerateQuizOutputSchema } from '../schemas/quiz-schema';


const GenerateQuizToolInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numQuestions: z.number().optional().default(5).describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().describe('The difficulty level of the quiz.'),
});

export const generateQuizTool = ai.defineTool(
  {
    name: 'generateQuizTool',
    description: 'Generates a practice quiz on a given topic.',
    inputSchema: GenerateQuizToolInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    return generateQuiz({
      topics: input.topic,
      numQuestions: input.numQuestions,
      difficulty: input.difficulty || 'Medium',
      questionType: 'Multiple Choice',
    });
  }
);
