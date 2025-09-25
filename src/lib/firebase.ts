import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCN57SiQKUSZ-5vgVLAvdmpI89be0vXWJ4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "creative-creatives-v2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "creative-creatives-v2",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "creative-creatives-v2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "918663847472",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:918663847472:web:4b111fa62f950a066717f5",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-YBL8239S34"
};

// Only initialize Firebase if explicitly configured (NOT in production by default)
const shouldInitializeFirebase = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// Initialize Firebase conditionally
let app: any = null;
if (shouldInitializeFirebase) {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  console.log('🔥 Firebase initialized for production/configured environment');
} else {
  console.log('🔧 Firebase initialization skipped - using development mode');
}

// Initialize Firebase services conditionally
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const functions = app ? getFunctions(app) : null;

// Initialize Analytics (only in browser and if app is initialized)
export const analytics = (app && typeof window !== 'undefined') ? getAnalytics(app) : null;

// Note: Emulators disabled for production compatibility
// Uncomment below for local development with Firebase emulators
/*
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    console.log('Emulators already connected or not available:', error);
  }
}
*/

export default app;
