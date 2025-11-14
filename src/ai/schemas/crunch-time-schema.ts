
import { z } from 'zod';

const KeyConceptSchema = z.object({
  term: z.string().describe('The key term or concept.'),
  definition: z.string().describe('A concise definition of the term.'),
});

const PracticeQuestionSchema = z.object({
  question: z.string().describe('A multiple-choice question testing a core concept.'),
  options: z.array(z.string()).length(4).describe('An array of 4 possible answers.'),
  answer: z.string().describe('The correct answer from the options array.'),
});

const StudyStepSchema = z.object({
  step: z.string().describe('A single, actionable step in the study plan.'),
  description: z.string().describe('A brief explanation of what to do in this step.')
});

const HowToStepSchema = z.object({
  step: z.string().describe('The title of the step in the how-to guide.'),
  description: z.string().describe('A detailed explanation of this step.'),
});

export const CrunchTimeInputSchema = z.object({
  inputType: z.enum(['text', 'url', 'image']).describe('The type of input provided.'),
  content: z.string().describe("The text content, URL, or image data URI."),
  learnerType: z.enum(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Unknown']),
  imageDataUri: z.string().optional().describe("The image data URI, if applicable. Added by the flow."),
});
export type CrunchTimeInput = z.infer<typeof CrunchTimeInputSchema>;


export const CrunchTimeOutputSchema = z.object({
  title: z.string().describe('A concise title for the study session, derived from the content.'),
  summary: z.string().describe('A 2-4 sentence summary of the core information.'),
  keyConcepts: z.array(KeyConceptSchema).describe('A list of 3-5 most important terms and their definitions from the material.'),
  howToGuide: z.array(HowToStepSchema).describe('A step-by-step guide for solving a problem or understanding a process from the material.'),
  practiceQuiz: z.array(PracticeQuestionSchema).describe('A small quiz of 3 multiple-choice questions to test understanding.'),
  studyPlan: z.array(StudyStepSchema).describe("A 3-step actionable study plan tailored to the user's learning style.")
});
export type CrunchTimeOutput = z.infer<typeof CrunchTimeOutputSchema>;
