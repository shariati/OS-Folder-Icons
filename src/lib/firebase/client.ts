import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import config from '../config';

const firebaseConfig = config.firebase;

// Initialize Firebase
let app: FirebaseApp = undefined as unknown as FirebaseApp;
let auth: Auth = undefined as unknown as Auth;
let db: Firestore = undefined as unknown as Firestore;

try {
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
        console.warn('Firebase config missing. Skipping initialization.');
    }
} catch (error) {
    console.warn('Firebase initialization failed:', error);
}

export { app, auth, db };
export const getFirebaseAuth = () => auth;
export const getFirebaseDB = () => db;
