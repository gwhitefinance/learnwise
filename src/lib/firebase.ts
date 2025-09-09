
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// This is the simplest, most direct way to configure Firebase.
// If this fails, the issue is not in the code but in the Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyC8nFez_Ye_qT0kVxEYK7uhGB6oQRbRfU0",
  authDomain: "learnwise-r6us0.firebaseapp.com",
  projectId: "learnwise-r6us0",
  storageBucket: "learnwise-r6us0.appspot.com",
  messagingSenderId: "224206262515",
  appId: "1:224206262515:web:d5960f2bc62f97be5ba786",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
