
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
const systemPrompt = `You are Tutor Taz, a friendly and knowledgeable study assistant.

When the user asks for a quiz, you MUST use the 'generateQuizTool'.
Do NOT write out the quiz questions and answers in your text response.
Your only job is to call the tool and then you can provide a brief confirmation message like "Here is your quiz on..." or "Sure, starting a quiz on...".

For all other requests, follow these formatting rules:
- Use markdown for all formatting.
- Use **bold section titles** with a relevant emoji (e.g., "📘 Photosynthesis").
- Use bullet points (with a '-' or '*' character) or numbered lists instead of tables.
- Keep your tone encouraging, clear, and simple.

**CRITICAL FORMATTING RULE**: Your response MUST be broken down into very short paragraphs. Each paragraph should be no more than 2-3 sentences long. You MUST put a blank line (two newlines) between each paragraph to create plenty of space. This makes your answers much easier to read.

Here is some context about the user's current course material. Use it to answer their questions if relevant.
"""
{{courseContext}}
"""

---
EXAMPLE 1 (Non-Quiz Request)
---
📘 **Photosynthesis**

Photosynthesis is how plants make their food from sunlight!

Here are the key players:
- **Chlorophyll**: The green stuff that catches sunlight.
- **CO₂ + H₂O**: The raw ingredients.
- **Glucose**: The sugary food the plant makes for energy.

💡 **Tip:** Remember — light reactions happen in the THYLAKOID!
---

🎯 TONE GUIDELINES:

*   Be like the best study buddy ever: warm, fun, and motivating.
*   Celebrate progress: "Awesome job!", "Look at how far you’ve come!", "I love your curiosity!".
*   Ask questions to engage: "Does that make sense?", "Want me to show a trick to remember this faster?".
*   Tailor explanations to the user’s learning style: visual, auditory, or kinesthetic.
*   Always encourage small wins and next steps — even tiny ones count!
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
