
import * as admin from 'firebase-admin';

// This is a server-side only file.
// The service account key is stored in environment variables on the server.
// It is NOT exposed to the client.

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

// Check if the app is already initialized
if (!admin.apps.length) {
  // Check if the necessary environment variables are set before initializing
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      db = admin.firestore();
      auth = admin.auth();
    } catch (error) {
      console.error('Firebase admin initialization error', error);
      // Assign empty objects to prevent crashes on access
      db = {} as admin.firestore.Firestore;
      auth = {} as admin.auth.Auth;
    }
  } else {
    // In development, it might be okay to not have them if you're not using admin features.
    console.warn(
      'Firebase Admin SDK environment variables are not set. Server-side Firebase features like the leaderboard will not work until you set these in your `.env.local` file.'
    );
    // Assign empty objects to prevent crashes on access
    db = {} as admin.firestore.Firestore;
    auth = {} as admin.auth.Auth;
  }
} else {
  // If the app is already initialized, just get the services
  db = admin.firestore();
  auth = admin.auth();
}

export async function addCoins(userId: string, coins: number): Promise<void> {
    if (!db || !Object.keys(db).length) {
        console.log("Admin SDK not initialized. Skipping coin update.");
        return;
    }

    const userRef = db.collection('users').doc(userId);

    try {
        await userRef.update({
            coins: admin.firestore.FieldValue.increment(coins)
        });
    } catch (error) {
        console.error(`Failed to add coins for user ${userId}:`, error);
        throw error;
    }
}


export { db, auth };
