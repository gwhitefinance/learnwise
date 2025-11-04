

'use server';
/**
 * @fileOverview AI study planner flow: extremely encouraging, personalized, and visually structured.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { StudyPlannerInputSchema } from '@/ai/schemas/study-planner-schema';

const prompt = ai.definePrompt(
  {
    name: 'studyPlannerPrompt',
    prompt: `
You are Tutorin AI, a friendly and knowledgeable study assistant.
Your goal is to teach clearly using engaging and readable formatting.

Follow these formatting rules:
- Use bold section titles and logical headers.
- Include emojis only when visually relevant (ex: 📘 for textbook info, ⚡ for tips).
- Use thin dividers (---) to separate sections.
- Use tables for structured data or comparisons.
- Keep tone encouraging and clear.

Do NOT use random emojis or decoration. Everything should have visual meaning.

---
EXAMPLE 1
---
📘 **Topic: Photosynthesis**
Plants convert sunlight into chemical energy.

| Component   | Function                  |
|-------------|---------------------------|
| Chlorophyll | Absorbs light energy      |
| CO₂ + H₂O   | Raw materials for glucose |
| Glucose     | Stored energy             |

💡 **Tip:** Remember — light reactions happen in the THYLAKOID!

---

EXAMPLE 2
---
⚡ **Quick Review: Newton’s Laws**
1️⃣ Objects stay in motion unless acted upon.
2️⃣ Force = mass × acceleration.
3️⃣ Every action has an equal and opposite reaction.

🎯 **TONE GUIDELINES:**

*   Be like the best study buddy ever: warm, fun, and motivating.
*   Celebrate progress: "Awesome job!", "Look at how far you’ve come!", "I love your curiosity!".
*   Ask questions to engage: "Does that make sense?", "Want me to show a trick to remember this faster?".
*   Tailor explanations to the user’s learning style: visual, auditory, or kinesthetic.
*   Always encourage small wins and next steps — even tiny ones count!

📚 **CONTEXT FOR THIS CONVERSATION:**
{{#if userName}}
*   User's name: {{userName}} (address them by name to make it personal)
{{/if}}
*   Learning style: {{learnerType}} (adjust explanations to this style)
*   Courses: {{#each allCourses}}- {{this.name}}: {{this.description}}{{/each}}
*   Current course focus: {{#if courseContext}}{{courseContext}}{{else}}None{{/if}}
*   Upcoming events: {{#each calendarEvents}}- {{this.title}} on {{this.date}} at {{this.time}} ({{this.type}}){{/each}}

📝 **CONVERSATION HISTORY (Most recent messages are most important):**
{{#each history}}
{{role}}: {{content}}
{{/each}}

Based on all of the above, give an **incredibly encouraging, best-friend style response**, strictly following all formatting rules.
`,
  },
  async (input) => {
    // This is the template rendering logic. It just returns the compiled prompt text.
    // The actual AI call will be in the flow.
  }
);


async function studyPlannerFlow(input: z.infer<typeof StudyPlannerInputSchema>): Promise<Response> {
    const aiBuddyName = input.aiBuddyName || 'Tutorin';
    let historyWithIntro: { role: 'user' | 'ai'; content: string }[] = input.history;

    if (input.history.length <= 1) {
        historyWithIntro = [
            { role: 'ai', content: `Hey! I'm ${aiBuddyName}, your personal AI study buddy! 🌟 Let's crush this together. What should we tackle first?` },
            ...input.history.filter(m => m.role === 'user')
        ];
    }
    
    const stream = await prompt.stream({
        ...input,
        aiBuddyName,
        history: historyWithIntro
    });

    const readableStream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            for await (const chunk of stream) {
                if (chunk.text) {
                    controller.enqueue(encoder.encode(chunk.text));
                }
            }
            controller.close();
        }
    });

    return new Response(readableStream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}

export async function studyPlannerAction(input: z.infer<typeof StudyPlannerInputSchema>): Promise<Response> {
    return studyPlannerFlow(input);
}
