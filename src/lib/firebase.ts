import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyDuq7jYQcKDKY3UWNxQwP51fKRwjCERuvo",
    authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "wakefield-central-mosque.firebaseapp.com",
    projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "wakefield-central-mosque",
    storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "wakefield-central-mosque.appspot.com",
    messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "998395111777",
    appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:998395111777:web:5492302e7279822d5cbd20",
    measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || "G-NXER4ENDE0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
