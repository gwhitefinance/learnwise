
'use server';

import { addXp as addXpAdmin } from './firebase-admin';

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
