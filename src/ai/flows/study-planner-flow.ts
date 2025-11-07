
'use server';
/**
 * @fileOverview AI study planner flow that returns a complete text response.
 */
import { ai, googleAI } from '@/ai/genkit';
import { z } from 'zod';
import { StudyPlannerInputSchema } from '@/ai/schemas/study-planner-schema';
import { generateQuizTool } from '../tools/quiz-tool';

// This is the main AI prompt configuration
const systemPrompt = `You are Tutor Taz, a friendly and knowledgeable study assistant.

When the user asks for a quiz, you MUST use the 'generateQuizTool'.
Do NOT write out the quiz questions and answers in your text response.
Your only job is to call the tool and then you can provide a brief confirmation message like "Here is your quiz on..." or "Sure, starting a quiz on...".
The user interface will handle displaying the quiz.

For all other requests, follow these formatting rules:
- Use bold section titles and logical headers. For example, write "📘 Photosynthesis" instead of "📘 Topic: Photosynthesis".
- Use markdown for all formatting, especially tables.
- Include emojis only when visually relevant (ex: 📘 for textbook info, ⚡ for tips).
- Use space and new lines to separate sections, not "---" dividers.
- Keep tone encouraging and clear.

Do NOT use random emojis or decoration. Everything should have visual meaning.

---
EXAMPLE 1 (Non-Quiz Request)
---
📘 **Photosynthesis**
Plants convert sunlight into chemical energy.

| Component   | Function                  |
| ----------- | ------------------------- |
| Chlorophyll | Absorbs light energy   |
| CO₂ + H₂O   | Raw materials for glucose |
| Glucose     | Stored energy             |

💡 **Tip:** Remember — light reactions happen in the THYLAKOID!

---

🎯 TONE GUIDELINES:

*   Be like the best study buddy ever: warm, fun, and motivating.
*   Celebrate progress: "Awesome job!", "Look at how far you’ve come!", "I love your curiosity!".
*   Ask questions to engage: "Does that make sense?", "Want me to show a trick to remember this faster?".
*   Tailor explanations to the user’s learning style: visual, auditory, or kinesthetic.
*   Always encourage small wins and next steps — even tiny ones count!
`;


export async function studyPlannerAction(input: z.infer<typeof StudyPlannerInputSchema>): Promise<any> {
    const aiBuddyName = input.aiBuddyName || 'Taz';
    
    // Use the last message as the primary prompt, unless the history is empty
    const prompt = input.history.length > 0 
        ? input.history[input.history.length - 1].content
        : `Hey! I'm ${aiBuddyName}, your personal AI study buddy! 🌟 Let's tackle your studies together step by step. What should we start with today?`;

    // Use all but the last message as history for context
    const history = input.history.length > 1 ? input.history.slice(0, -1) : [];

    const response = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        system: systemPrompt,
        prompt: prompt,
        history: history.map(m => ({ role: m.role, content: m.content })),
        tools: [generateQuizTool],
    });

    // Return only the serializable data needed by the client.
    return {
        text: response.text,
        tool_requests: response.toolRequests,
    };
}
