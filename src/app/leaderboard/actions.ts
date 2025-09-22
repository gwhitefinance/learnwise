
'use server';

import { db } from '@/lib/firebase-admin';
import { UserProfile } from './page';

export async function getLeaderboard(): Promise<UserProfile[]> {
    try {
        const usersRef = db.collection('users');
        const q = usersRef.orderBy('coins', 'desc').limit(100);
        const querySnapshot = await q.get();

        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                uid: doc.id,
                displayName: data.displayName,
                email: data.email,
                coins: data.coins,
                level: Math.floor(data.coins / 100),
            });
        });
        return users;
    } catch (error) {
        console.error("Error fetching leaderboard on server:", error);
        // Depending on your error handling strategy, you might want to
        // rethrow the error or return an empty array.
        // For a public leaderboard, returning empty is often safer.
        return [];
    }
}
