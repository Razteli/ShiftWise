// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUKnZy-MOiD8peOgb8Lf3NccPZ9ygsXl4",
  authDomain: "shiftwise-ae8fd.firebaseapp.com",
  projectId: "shiftwise-ae8fd",
  storageBucket: "shiftwise-ae8fd.firebasestorage.app",
  messagingSenderId: "651059593737",
  appId: "1:651059593737:web:d74117514e98a10ff26ed8"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
