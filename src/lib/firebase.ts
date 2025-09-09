
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

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

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Conditionally initialize messaging only on the client side
const messaging = async () => {
    const isSupportedBrowser = await isSupported();
    return isSupportedBrowser ? getMessaging(app) : null;
};


export { app, auth, db, messaging };
