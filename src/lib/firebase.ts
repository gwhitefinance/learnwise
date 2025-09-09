
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "learnwise-r6us0.firebaseapp.com",
  projectId: "learnwise-r6us0",
  storageBucket: "learnwise-r6us0.appspot.com",
  messagingSenderId: "224206262515",
  appId: "1:224206262515:web:d5960f2bc62f97be5ba786",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);

export { app, auth };
