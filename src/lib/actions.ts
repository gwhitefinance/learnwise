'use server';

import { addXp as addXpAdmin } from './firebase-admin';
import { generateQuiz } from '@/ai/flows/quiz-flow';
import type { GenerateQuizInput, GenerateQuizOutput } from '@/ai/schemas/quiz-schema';

export async function addXp(userId: string, xp: number) {
    try {
        const result = await addXpAdmin(userId, xp);
        return result;
    } catch(e) {
        console.error("Action error adding XP:", e);
        // This will be caught by the client-side try/catch block
        throw new Error("Failed to update XP on the server.");
    }
}

export async function generateQuizAction(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
    try {
        const quiz = await generateQuiz(input);
        return quiz;
    } catch (e) {
        console.error("Action error generating quiz:", e);
        throw new Error("Failed to generate quiz on the server.");
    }
}
