
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "learnwise-r6us0",
  appId: "1:224206262515:web:d5960f2f2bc62f97be5ba786",
  storageBucket: "learnwise-r6us0.appspot.com",
  apiKey: "AIzaSyC8nFez_Ye_qT0kVxEYK7uhGB6oQRbRfU0",
  authDomain: "learnwise-r6us0.firebaseapp.com",
  messagingSenderId: "224206262515",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
