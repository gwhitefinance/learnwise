
import * as admin from 'firebase-admin';

// DO NOT USE process.env HERE
// Directly hardcode the configuration values.
const firebaseConfig = {
  apiKey: "AIzaSyC8nFez_Ye_qT0kVxEYK7uhGB6oQRbRfU0",
  authDomain: "learnwise-r6us0.firebaseapp.com",
  projectId: "learnwise-r6us0",
  storageBucket: "learnwise-r6us0.firebasestorage.app",
  messagingSenderId: "224206262515",
  appId: "1:224206262515:web:d5960f2bc62f97be5ba786",
  measurementId: "G-E68DBM3BDM"
};

// This is a server-side only file.
// The service account key is stored in an environment variable on the server.
// It is NOT exposed to the client.
if (!admin.apps.length) {
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

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
