
/**
 * @fileoverview Defines the data schemas for the roadmap generation feature.
 */
import { z } from 'zod';

export const GenerateRoadmapInputSchema = z.object({
  courseName: z.string().describe('The name of the course.'),
  courseDescription: z.string().optional().describe('The description of the course.'),
  courseUrl: z.string().url().optional().or(z.literal('')).describe('The URL for the course materials.'),
  currentDate: z.string().optional().describe("The current date in YYYY-MM-DD format to use as a starting point."),
  webContent: z.string().optional().describe("The text content scraped from the course URL.")
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadband.md>;

const GoalSchema = z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional().describe("An icon from lucide-react to represent the goal, e.g., 'Flag' or 'Trophy'. Defaults to 'Flag' if not provided."),
});

const MilestoneSchema = z.object({
    date: z.string().describe("The date for the milestone in YYYY-MM-DD format."),
    title: z.string(),
    description: z.string(),
    icon: z.string().optional().describe("An icon from lucide-react to represent the milestone, e.g., 'Calendar' or 'CheckCircle'. Defaults to 'Calendar' if not provided."),
});

export const GenerateRoadmapOutputSchema = z.object({
  goals: z.array(GoalSchema),
  milestones: z.array(MilestoneSchema),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;
