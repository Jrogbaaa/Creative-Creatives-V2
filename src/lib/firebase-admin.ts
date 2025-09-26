import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Check for credentials - use Firebase-specific vars first, fallback to Google Cloud vars
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || process.env.GOOGLE_CLOUD_PRIVATE_KEY)?.replace(/\\n/g, '\n');

console.log('🔧 [Firebase Admin] Configuration check:', {
  hasProjectId: !!projectId,
  hasClientEmail: !!clientEmail,
  hasPrivateKey: !!privateKey,
  projectId: projectId?.substring(0, 20) + '...',
});

// Validate that we have all required credentials
const hasAllCredentials = projectId && clientEmail && privateKey;

if (!hasAllCredentials) {
  console.warn('⚠️ [Firebase Admin] Missing credentials, using development mode');
  console.warn('   Missing:', {
    projectId: !projectId,
    clientEmail: !clientEmail,
    privateKey: !privateKey
  });
}

const firebaseAdminConfig = hasAllCredentials ? {
  credential: cert({
    projectId,
    clientEmail,
    privateKey,
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
} : null;

// Initialize Firebase Admin only if we have valid credentials
const adminApp = hasAllCredentials && firebaseAdminConfig
  ? (getApps().length > 0 ? getApps()[0] : initializeApp(firebaseAdminConfig))
  : null;

// Export admin services only if adminApp is initialized
export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;
export const adminStorage = adminApp ? getStorage(adminApp) : null;

// Export the app and configuration status for debugging
export { adminApp };
export const isAdminConfigured = hasAllCredentials;

export default adminApp;
