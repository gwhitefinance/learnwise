'use server';
/**
 * @fileOverview AI study planner flow that streams responses chunk by chunk.
 */
import { ai, googleAI } from '@/ai/genkit';
import { z } from 'zod';
import { StudyPlannerInputSchema } from '@/ai/schemas/study-planner-schema';
import { streamFlow } from 'genkit/next/server';

// This is the main AI prompt configuration
const studyPlannerPrompt = ai.definePrompt(
  {
    name: 'studyPlannerPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: {
      schema: z.object({
        userNameContext: z.string(),
        learnerTypeContext: z.string(),
        coursesContext: z.string(),
        courseFocusContext: z.string(),
        eventsContext: z.string(),
        historyText: z.string(),
      }),
    },
    system: `You are Tutorin AI, a friendly and knowledgeable study assistant.
Your goal is to teach clearly using engaging and readable formatting.

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
`,
    prompt: (input) => `${input.userNameContext}
${input.learnerTypeContext}
${input.coursesContext}
${input.courseFocusContext}
${input.eventsContext}

📝 **Conversation History (Most recent messages are most important):**
${input.historyText}

Based on all of the above, give an **incredibly encouraging, best-friend style response**, strictly following all formatting rules.
`,
  },
  // The 'json' option is not used here, so we remove it.
  // The default output is text, which is what we want for streaming.
);

export const studyPlannerAction = streamFlow(
  {
    name: 'studyPlannerFlow',
    inputSchema: StudyPlannerInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    // 1. Prepare the context strings for the prompt
    const aiBuddyName = input.aiBuddyName || 'Tutorin';
    let historyWithIntro: { role: 'user' | 'ai'; content: string }[] = input.history;

    if (input.history.length <= 1 && input.history[0]?.role === 'user') {
      historyWithIntro = [
        { role: 'ai', content: `Hey! I'm ${aiBuddyName}, your personal AI study buddy! 🌟 Let's tackle your studies together step by step. What should we start with today?` },
        ...input.history,
      ];
    }
    
    const userNameContext = input.userName ? `- User's name: ${input.userName} (address them personally)` : '';
    const learnerTypeContext = `- Learning style: ${input.learnerType || 'Unknown'} (tailor explanations to this style)`;
    const coursesContext = `- Courses:\n${input.allCourses?.map(c => `  - ${c.name}: ${c.description}`).join('\n') || '  None'}`;
    const courseFocusContext = `- Current focus: ${input.courseContext || 'None'}`;
    const eventsContext = `- Upcoming events:\n${input.calendarEvents?.map(e => `  - ${e.title} on ${e.date} at ${e.startTime} (${e.type})`).join('\n') || '  None'}`;
    const historyText = historyWithIntro.map(m => `${m.role}: ${m.content}`).join('\n');

    // 2. Stream the AI response
    const stream = await studyPlannerPrompt.stream({
        userNameContext,
        learnerTypeContext,
        coursesContext,
        courseFocusContext,
        eventsContext,
        historyText,
    });
    
    // 3. Yield the chunks of the stream
    for await (const chunk of stream.text()) {
      yield chunk;
    }
  }
);
