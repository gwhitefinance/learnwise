
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  content: z.string(),
});

export const EssayCoachInputSchema = z.object({
  essay: z.string().describe("The current draft of the user's college essay."),
  prompt: z.string().describe("The user's specific question or request for feedback."),
  history: z.array(MessageSchema).optional().describe('The conversation history so far.'),
});

export const EssayCoachOutputSchema = z.object({
  feedback: z.string().describe("Constructive, encouraging, and actionable feedback on the user's essay based on their prompt."),
});

// New schemas for grading

export const EssayGradeInputSchema = z.object({
    essay: z.string().describe("The full text of the essay to be graded."),
    rubric: z.string().describe("The rubric to be used for grading (e.g., 'Standard Essay Rubric', 'Argumentative Paper Rubric')."),
    gradeLevel: z.string().describe("The academic level of the student (e.g., 'High School', 'College')."),
});

const FeedbackItemSchema = z.object({
    criteria: z.string().describe("The evaluation criteria (e.g., 'Thesis', 'Introduction', 'Body/Evidence')."),
    score: z.number().int().min(0).max(100).describe("The score for this specific criteria, from 0 to 100."),
});

const SuggestionItemSchema = z.object({
    title: z.string().describe("The area of improvement (e.g., 'Thesis', 'Body/Evidence')."),
    originalText: z.string().describe("The exact quote from the original essay that can be improved."),
    suggestedRewrite: z.string().describe("A rewritten version of the text that shows the suggested improvement."),
});

export const EssayGradeOutputSchema = z.object({
    overallScore: z.number().int().min(0).max(100).describe("An overall integer score for the essay from 0 to 100."),
    feedback: z.array(FeedbackItemSchema).describe("An array of feedback items, each with a criteria and a score."),
    suggestions: z.array(SuggestionItemSchema).describe("An array of specific suggestions for rewriting parts of the essay."),
});
