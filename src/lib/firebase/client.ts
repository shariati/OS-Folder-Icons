import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import config from '../config';

const firebaseConfig = config.firebase;

// Initialize Firebase
let app: FirebaseApp = undefined as unknown as FirebaseApp;
let auth: Auth = undefined as unknown as Auth;
let db: Firestore = undefined as unknown as Firestore;
let storage: FirebaseStorage = undefined as unknown as FirebaseStorage;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } else {
    console.warn('Firebase config missing. Skipping initialization.');
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error);
}

export { app, auth, db, storage };
export const getFirebaseAuth = () => auth;
export const getFirebaseDB = () => db;
export const getFirebaseStorage = () => storage;
