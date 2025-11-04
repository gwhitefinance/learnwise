
'use server';
/**
 * @fileOverview AI study planner flow that returns a complete text response.
 */
import { ai, googleAI } from '@/ai/genkit';
import { z } from 'zod';
import { StudyPlannerInputSchema } from '@/ai/schemas/study-planner-schema';
import { generateQuizTool } from '../tools/quiz-tool';

// This is the main AI prompt configuration
const systemPrompt = `You are Tutorin AI, a friendly and knowledgeable study assistant.
Your goal is to teach clearly using engaging and readable formatting.

When the user asks for a quiz, you MUST use the 'generateQuizTool' to create it.
Then, respond with a confirmation message like "Here is a quiz on..." and present the quiz data.

Follow these formatting rules:
- Use bold section titles and logical headers. For example, write "📘 Photosynthesis" instead of "📘 Topic: Photosynthesis".
- Use markdown for all formatting, especially tables.
- Include emojis only when visually relevant (ex: 📘 for textbook info, ⚡ for tips).
- Use space and new lines to separate sections, not "---" dividers.
- Keep tone encouraging and clear.

Do NOT use random emojis or decoration. Everything should have visual meaning.

---
EXAMPLE 1
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
    const aiBuddyName = input.aiBuddyName || 'Tutorin';
    let historyWithIntro: { role: 'user' | 'ai'; content: string }[] = input.history;

    if (input.history.length === 0) {
      historyWithIntro = [
        { role: 'ai', content: `Hey! I'm ${aiBuddyName}, your personal AI study buddy! 🌟 Let's tackle your studies together step by step. What should we start with today?` },
        ...input.history.filter(m => m.role === 'user')
      ];
    }
    
    const userNameContext = input.userName ? `- User's name: ${input.userName} (address them personally)` : '';
    const learnerTypeContext = `- Learning style: ${input.learnerType || 'Unknown'} (tailor explanations to this style)`;
    const coursesContext = `- Courses:\n${input.allCourses?.map(c => `  - ${c.name}: ${c.description}`).join('\n') || '  None'}`;
    const courseFocusContext = `- Current focus: ${input.courseContext || 'None'}`;
    const eventsContext = `- Upcoming events:\n${input.calendarEvents?.map(e => `  - ${e.title} on ${e.date} at ${e.startTime} (${e.type})`).join('\n') || '  None'}`;
    
    const latestUserMessage = input.history[input.history.length - 1]?.content || '';

    const response = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        system: systemPrompt,
        prompt: latestUserMessage,
        history: historyWithIntro.map(m => ({ role: m.role, content: m.content })),
        tools: [generateQuizTool],
    });

    return response.output;
}
