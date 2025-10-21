
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
        const q = usersRef.orderBy('coins', 'desc');
        const querySnapshot = await q.get();

        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                uid: doc.id,
                displayName: data.displayName || 'Anonymous',
                email: data.email,
                coins: data.coins || 0,
                photoURL: data.photoURL,
            });
        });
        return users;
    } catch (error) {
        console.error("Error fetching leaderboard on server:", error);
        return [];
    }
}
