import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration (from google-services.json)
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "fitnessai-12345.firebaseapp.com",
  projectId: "fitnessai-12345",
  storageBucket: "fitnessai-12345.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:android:abc123def456",
  measurementId: "G-ABCDEF1234" // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Enable offline persistence (optional)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn("Offline persistence can only be enabled in one tab at a time.");
  } else if (err.code == 'unimplemented') {
    console.warn("The current browser does not support offline persistence.");
  }
});

// Initialize Portugal food database reference
export const portugueseFoodsRef = collection(db, "portuguese_foods");
export const userMealsRef = (userId: string) => collection(db, `users/${userId}/meals`);