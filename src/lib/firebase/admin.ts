import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

const firebaseAdminConfig = {
    credential: serviceAccount ? cert(serviceAccount) : undefined,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

let app: App = undefined as unknown as App;
let db: Firestore = undefined as unknown as Firestore;
let auth: Auth = undefined as unknown as Auth;

try {
    if (firebaseAdminConfig.projectId && serviceAccount) {
        app = !getApps().length ? initializeApp(firebaseAdminConfig) : getApp();
        db = getFirestore(app);
        auth = getAuth(app);
    } else {
        console.warn('Firebase Admin config missing. Skipping initialization.');
    }
} catch (error) {
    console.warn('Firebase Admin initialization failed:', error);
}

export { app as adminApp, db as adminDb, auth as adminAuth };
