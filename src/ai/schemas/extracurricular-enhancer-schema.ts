/**
 * @fileoverview Defines the data schemas for the extracurricular activity enhancer.
 */
import { z } from 'zod';

export const EnhanceExtracurricularInputSchema = z.object({
  activityDescription: z.string().describe('A brief, user-written description of an extracurricular activity.'),
});
export type EnhanceExtracurricularInput = z.infer<typeof EnhanceExtracurricularInputSchema>;


export const EnhanceExtracurricularOutputSchema = z.object({
  enhancedDescription: z.string().describe("A professionally rephrased version of the activity, highlighting leadership, skills, and impact."),
  strength: z.number().int().min(0).max(100).describe('An estimated strength score (0-100) of the activity for college applications, based on impact and commitment.'),
});
export type EnhanceExtracurricularOutput = z.infer<typeof EnhanceExtracurricularOutputSchema>;
