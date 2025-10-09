
import * as admin from 'firebase-admin';

// This is a server-side only file.
// The service account key is stored in environment variables on the server.
// It is NOT exposed to the client.

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

try {
    if (admin.apps.length === 0 && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
    }
    db = admin.firestore();
    auth = admin.auth();
} catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
}


export { db, auth as adminAuth };
