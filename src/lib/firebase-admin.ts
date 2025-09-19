
import admin from 'firebase-admin';
import serviceAccountKey from '../../serviceAccountKey.json';

let app: admin.app.App;

try {
  // Type assertion to ensure the imported JSON conforms to the ServiceAccount interface
  const serviceAccount = serviceAccountKey as admin.ServiceAccount;

  if (admin.apps.length > 0) {
    app = admin.app();
  } else {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized successfully.');
  }
} catch (error: any) {
  console.error('❌ FIREBASE_ADMIN_ERROR: Failed to initialize Firebase Admin SDK.', error);
  // We throw an error here to make it clear during development that the admin SDK failed to initialize.
  // In a production environment, you might handle this more gracefully.
  throw new Error('Could not initialize Firebase Admin SDK. Please check your serviceAccountKey.json file and Firebase project settings.');
}

const adminDb = app.firestore();
const adminAuth = app.auth();

// This is a simple async function to make the initialized instances available elsewhere.
// This avoids re-running the initialization logic on every call.
async function getFirebaseAdmin() {
  return { adminDb, adminAuth };
}

export { getFirebaseAdmin };
