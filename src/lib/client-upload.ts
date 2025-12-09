import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to Firebase Storage using the Client SDK.
 * This bypasses server-side auth issues and uses the logged-in user's credentials directly.
 */
export const uploadToFirebase = async (file: File, user: any) => {
    if (!user) throw new Error('You must be logged in to upload files');
    if (!storage) throw new Error('Firebase Storage not initialized');

    const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    // Using 'public/uploads' to match the 'public' rule group allowing authenticated writes
    const storageRef = ref(storage, `public/uploads/${filename}`);

    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
};
