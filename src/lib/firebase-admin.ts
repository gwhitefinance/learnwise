
import * as admin from 'firebase-admin';

// This is a server-side only file.
// The service account key is stored in environment variables on the server.
// It is NOT exposed to the client.

let app: admin.app.App;

// Check if the necessary environment variables are set before initializing
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY
) {
  if (process.env.NODE_ENV === 'production') {
    // In production, you'll want to ensure these are set.
    // This will cause the server to fail to start if they are missing.
    throw new Error(
      'Firebase Admin SDK environment variables are not set. Please add them to your production environment.'
    );
  } else {
    // In development, it might be okay to not have them if you're not using admin features.
    console.warn(
      'Firebase Admin SDK environment variables are not set. Server-side Firebase features like the leaderboard will not work until you set these in your `.env.local` file.'
    );
  }
}

if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
  try {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

// Only export db and auth if the app was initialized
if (admin.apps.length) {
  db = admin.firestore();
  auth = admin.auth();
} else {
  // Provide dummy objects or handle the case where admin is not initialized
  // This prevents the app from crashing if the admin SDK is not configured
  db = {} as admin.firestore.Firestore;
  auth = {} as admin.auth.Auth;
}


// --- LEVELING SYSTEM ---
const XP_PER_LEVEL = 100;

export async function addXp(userId: string, xp: number): Promise<{ levelUp: boolean, newLevel: number }> {
  if (!db || !Object.keys(db).length) {
    console.log("Admin SDK not initialized. Skipping XP update.");
    return { levelUp: false, newLevel: 0 };
  }

  const userRef = db.collection('users').doc(userId);
  
  try {
    const doc = await userRef.get();
    if (!doc.exists) {
      throw new Error('User not found');
    }

    const userData = doc.data()!;
    const currentXp = userData.xp || 0;
    const currentLevel = userData.level || 1;
    
    const newXp = currentXp + xp;
    let newLevel = currentLevel;
    let levelUp = false;

    // Check for level up
    const xpForNextLevel = currentLevel * XP_PER_LEVEL;
    if (newXp >= xpForNextLevel) {
      newLevel += 1;
      levelUp = true;
      await userRef.update({
        xp: newXp - xpForNextLevel, // Reset XP for the new level
        level: newLevel,
        coins: admin.firestore.FieldValue.increment(50 * newLevel) // Award coins on level up
      });
    } else {
      await userRef.update({
        xp: newXp
      });
    }

    return { levelUp, newLevel };

  } catch (error) {
    console.error(`Failed to add XP for user ${userId}:`, error);
    throw error;
  }
}


export { db, auth };
