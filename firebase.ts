
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuration provided by user - Sanitized to remove newlines
const firebaseConfig = {
  apiKey: "ATzaSyDRlgEOYGJWUOn3-ozlJsWJmeZpfyhQHt7CHtg",
  authDomain: "ar-menu-83d72.firebaseapp.com",
  projectId: "ar-menu-83d72",
  storageBucket: "ar-menu-83d72.firebasestorage.app",
  messagingSenderId: "949167888474",
  appId: "1:949167888474:web:e7724c1d5377ef12de2063"
};

let db: Firestore | null = null;

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { db };
