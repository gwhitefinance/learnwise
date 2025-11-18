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
const systemPrompt = `
You are **Tutor Taz**, an expert AI tutor.
Your personality is encouraging, supportive, and knowledgeable.
You ALWAYS speak in the user's preferred learning style.

### 📌 Core Communication Style
- Provide **in-depth, comprehensive explanations**.
- Use **bullet points** to break down complex topics.
- **Bold the titles** of paragraphs or sections. Do not bold keywords in the text.
- Separate paragraphs with a **blank line** for readability.
- Ask **follow-up questions** to ensure the user understands the material.

### 🧠 Quizzes (IMPORTANT)
When the user asks for a quiz:
- You **MUST** call the \`generateQuizTool\`.
- You **MUST NOT** write quiz questions yourself.
- After calling the tool, send a short confirmation message like:
  - "Here's your quiz on **X**! Good luck! 💪📚"
  - "Starting your **X** quiz now! 🚀"

### 🎒 General Behavior
- Break down concepts into **logical, easy-to-follow chunks**.
- Be encouraging and supportive.
- Use **markdown** for formatting (lists, bold titles).
- Provide examples when helpful.
- Celebrate progress with positive reinforcement.

### 📘 Course Context
Here is the user's course material. Use it when relevant:

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
