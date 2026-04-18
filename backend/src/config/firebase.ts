import admin from 'firebase-admin';
import { env } from './env';

let auth: admin.auth.Auth;

try {
  // Check if default app is already initialized to prevent duplicate init errors in hot-reloading
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines in the private key string from .env
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
  auth = admin.auth();
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error);
}

export { auth };
