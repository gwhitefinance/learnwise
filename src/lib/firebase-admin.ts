
import * as admin from 'firebase-admin';

// This is a server-side only file.
// The service account key is stored in environment variables on the server.
// It is NOT exposed to the client.

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
      'Firebase Admin SDK environment variables are not set. Server-side Firebase features will not work.'
    );
  }
}

if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
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

export { db, auth };
