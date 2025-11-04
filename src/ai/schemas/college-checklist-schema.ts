
import { z } from 'zod';

export const CollegeChecklistInputSchema = z.object({
  collegeName: z.string().describe("The name of the college."),
  acceptanceRate: z.number().nullable().describe("The overall admission rate of the college."),
  satScore: z.number().nullable().describe("The average SAT score for admitted students.")
});

const ChecklistItemSchema = z.object({
  name: z.string().describe("The name of the admission factor (e.g., 'Rigor of secondary school record', 'GPA', 'Test Scores')."),
  level: z.enum(['Very Important', 'Considered', 'Not Considered']).describe("The importance level of this factor.")
});

export const CollegeChecklistOutputSchema = z.object({
  checklist: z.array(ChecklistItemSchema).describe("An array of admission factors and their importance levels.")
});
