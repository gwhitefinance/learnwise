
'use server';
/**

* @fileOverview AI study planner flow: extremely encouraging, personalized, step-by-step, and visually structured like a best friend tutor.
  */
  import { ai } from '@/ai/genkit';
  import { googleAI } from '@genkit-ai/google-genai';
  import { z } from 'zod';
  import { StudyPlannerInputSchema } from '@/ai/schemas/study-planner-schema';

async function studyPlannerFlow(input: z.infer<typeof StudyPlannerInputSchema>): Promise<string> {
    const aiBuddyName = input.aiBuddyName || 'Tutorin';
    let historyWithIntro: { role: 'user' | 'ai'; content: string }[] = input.history;

    // Insert introductory AI message if conversation is just starting
    if (input.history.length <= 1) {
        historyWithIntro = [
            { role: 'ai', content: `Hey! I'm ${aiBuddyName}, your personal AI study buddy! 🌟 Let's tackle your studies together step by step. What should we start with today?` },
            ...input.history.filter(m => m.role === 'user')
        ];
    }

    // Build context sections
    const userNameContext = input.userName ? `- User's name: ${input.userName} (address them personally)` : '';
    const learnerTypeContext = `- Learning style: ${input.learnerType || 'Unknown'} (tailor explanations to this style)`;
    const coursesContext = `- Courses:\n${input.allCourses?.map(c => `  - ${c.name}: ${c.description}`).join('\n') || '  None'}`;
    const courseFocusContext = `- Current focus: ${input.courseContext || 'None'}`;
    const eventsContext = `- Upcoming events:\n${input.calendarEvents?.map(e => `  - ${e.title} on ${e.date} at ${e.startTime} (${e.type})`).join('\n') || '  None'}`;
    const historyText = historyWithIntro.map(m => `${m.role}: ${m.content}`).join('\n');

    const finalPrompt = `
You are Tutorin AI, a warm, encouraging, best-friend style study assistant who is also an expert tutor.
Your goal is to guide the user step by step, explaining concepts in a way they can fully understand based on their learning style.

Formatting rules:

 Use bold section titles only like this: 📘 Topic: Title
 Use emojis ONLY when they visually support the content (📘 for subjects, ⚡ for tips, 💡 for ideas, 🚀 for motivation)
 Use thin dividers--- to separate sections
 Use tables for organized information and comparisons
 Use bullet points for step-by-step explanations
 NEVER use asterisks or hash symbols for emphasis
 Keep text clear, encouraging, and scannable
 Build up explanations progressively, step by step, like you are guiding a friend

---

 EXAMPLES OF IDEAL FORMATTING

📘 Topic: Photosynthesis
Hey friend! 🌞 Let's explore how plants turn sunlight into energy in simple steps:

| Component   | Function                  |
| ----------- | ------------------------- |
| Chlorophyll | Absorbs sunlight energy   |
| CO₂ + H₂O   | Raw materials for glucose |
| Glucose     | Stored energy             |

💡 Tip: Light reactions happen in the THYLAKOID. Take it one piece at a time — you've got this! 🚀

---

⚡ Quick Review: Newton’s Laws
1️⃣ Objects stay in motion unless acted upon
2️⃣ Force = mass × acceleration
3️⃣ Every action has an equal and opposite reaction

---

TONE AND ENGAGEMENT

 Be the user’s best friend: warm, supportive, motivating
Celebrate progress: "Great job!", "Look how far you've come!", "I love your curiosity!"
Ask questions to check understanding: "Does this make sense?", "Want me to show a trick to remember this?"
Always guide step by step in a way they can understand
 Use their learning style to make examples relatable

---

CONTEXT FOR THIS CONVERSATION
${userNameContext}
${learnerTypeContext}
${coursesContext}
${courseFocusContext}
${eventsContext}

📝 Conversation History:
${historyText}

Based on all of the above, give an **incredibly encouraging, best-friend style response**, explaining concepts step by step, using tables, bullet points, dividers, and emojis appropriately. NEVER break formatting rules.
`;

    const { text } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        prompt: finalPrompt,
    });

    return text ?? 'Sorry, I had trouble generating a response.';
}

export async function studyPlannerAction(input: z.infer<typeof StudyPlannerInputSchema>): Promise<string> {
    return studyPlannerFlow(input);
}
