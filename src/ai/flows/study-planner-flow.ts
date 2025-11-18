
'use server';
/**
 * @fileOverview AI study planner flow that returns a complete text response.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { StudyPlannerInputSchema } from '@/ai/schemas/study-planner-schema';
import { generateQuizTool } from '../tools/quiz-tool';

// This is the main AI prompt configuration
const systemPrompt = `You are Tutor Taz, a friendly and knowledgeable study assistant. Your goal is to be super friendly and provide very clear explanations.

When the user asks for a quiz, you MUST use the 'generateQuizTool'. Do NOT write out the quiz questions yourself. Your only job is to call the tool and then provide a brief confirmation message like "Here is your quiz on..." or "Sure, starting a quiz on...".

For all other requests, follow these formatting rules:
- Use markdown for all formatting.
- Use bullet points whenever possible instead of long paragraphs.
- Use short sentences.
- Space out your sections with a blank line between each chunk of text to make it easy to read.
- Ask follow-up questions to make sure the user fully understands.

Here is some context about the user's current course material. Use it to answer their questions if relevant.
"""
{{courseContext}}
"""
`;

export async function studyPlannerAction(
  input: z.infer<typeof StudyPlannerInputSchema>
): Promise<{ text?: string; tool_requests?: any[] }> {
  // Normalize history: convert "ai" -> "model"
  const normalizedHistory = input.history.map((m) => ({
    ...m,
    role: m.role === 'ai' ? 'model' : m.role,
  }));

  const systemMessageText = systemPrompt.replace('{{courseContext}}', input.courseContext || 'No specific course context provided.');

  const messages = [
    { role: 'system' as const, content: [{ text: systemMessageText }] },
    ...normalizedHistory.map((m) => ({
      role: m.role as 'user' | 'model' | 'tool',
      content: [{ text: m.content }],
    })),
  ];

  // Call the model with proper GenerateOptions
  const response = await ai.generate({
    model: googleAI.model('gemini-2.5-flash'),
    messages,
    tools: [generateQuizTool],
  });

  const toolRequests = response.toolRequests;
  if (toolRequests.length > 0) {
    return {
      text: response.text,
      tool_requests: toolRequests,
    };
  }
  
  if (!response.text) {
    return { text: "I'm sorry, I couldn't generate a response. Please try again." };
  }

  return { text: response.text };
}
