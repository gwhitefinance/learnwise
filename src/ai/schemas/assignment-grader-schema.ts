
import { z } from 'zod';

export const GradeAssignmentInputSchema = z.object({
  assignment: z.string().describe('The content of the assignment to be graded.'),
  rubric: z.string().optional().describe('Optional rubric or specific instructions for grading.'),
});
export type GradeAssignmentInput = z.infer<typeof GradeAssignmentInputSchema>;

export const GradeAssignmentOutputSchema = z.object({
  score: z.number().int().min(0).max(100).describe('An integer score from 0 to 100.'),
  strengths: z.array(z.string()).describe('A list of 2-3 key strengths of the assignment.'),
  improvements: z.array(z.string()).describe('A list of 2-3 specific, actionable areas for improvement.'),
  finalVerdict: z.string().describe('A concise, one-sentence overall verdict on the work.'),
});
export type GradeAssignmentOutput = z.infer<typeof GradeAssignmentOutputSchema>;
