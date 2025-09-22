
'use server';

import { db } from '@/lib/firebase-admin';
import { UserProfile } from './page';

export async function getLeaderboard(): Promise<UserProfile[]> {
    if (!db || !Object.keys(db).length) {
      console.warn(
        'Firebase Admin SDK is not initialized. Leaderboard data cannot be fetched. Ensure your server environment variables are set.'
      );
      return [];
    }

    try {
        const usersRef = db.collection('users');
        // Order by level first, then by XP within the same level
        const q = usersRef.orderBy('level', 'desc').orderBy('xp', 'desc').limit(100);
        const querySnapshot = await q.get();

        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                uid: doc.id,
                displayName: data.displayName || 'Anonymous',
                email: data.email,
                coins: data.coins || 0,
                level: data.level || 1,
                xp: data.xp || 0,
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
