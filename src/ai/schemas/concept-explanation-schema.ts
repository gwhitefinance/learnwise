
/**
 * @fileoverview Defines the data schemas for the concept explanation feature.
 */
import { z } from 'zod';

export const ConceptExplanationInputSchema = z.object({
  term: z.string().describe('The key term to be explained.'),
  definition: z.string().describe('The original definition of the term.'),
  courseContext: z.string().describe('The name and description of the course for context.'),
  explanationType: z.enum(['simple', 'analogy', 'sentence']).describe('The desired type of explanation.'),
});
export type ConceptExplanationInput = z.infer<typeof ConceptExplanationInputSchema>;


export const ConceptExplanationOutputSchema = z.object({
  explanation: z.string().describe('The generated explanation for the concept.'),
});
export type ConceptExplanationOutput = z.infer<typeof ConceptExplanationOutputSchema>;
