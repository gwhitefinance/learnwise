
import * as admin from 'firebase-admin';

// This is a server-side only file.
// The service account key is stored in environment variables on the server.
// It is NOT exposed to the client.

function initializeAdmin() {
  // Check if the app is already initialized to prevent re-initialization errors
  if (admin.apps.length > 0) {
    return {
      db: admin.firestore(),
      auth: admin.auth(),
    };
  }

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
          // The private key needs to have its newlines properly escaped.
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log("Firebase Admin SDK initialized successfully.");
      return {
        db: admin.firestore(),
        auth: admin.auth(),
      };
    } catch (error) {
      console.error('Firebase admin initialization error', error);
    }
  } else {
    // In development, it's useful to log a warning if env vars are missing.
    console.warn(
      'Firebase Admin SDK environment variables are not set. Server-side Firebase features will not work until you set them.'
    );
  }

  // Return non-functional stubs if initialization fails to prevent crashes on access
  return {
    db: {} as admin.firestore.Firestore,
    auth: {} as admin.auth.Auth,
  };
}

const { db, auth } = initializeAdmin();

export async function addCoins(userId: string, coins: number): Promise<void> {
    if (!db || typeof db.collection !== 'function') {
        throw new Error("Admin SDK not properly initialized. Skipping coin update.");
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


export { db, auth as adminAuth };
