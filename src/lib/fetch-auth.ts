import { getAuth } from 'firebase/auth';
import { getFirebaseAuth } from './firebase/client';

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
    // Ensure auth is initialized
    const auth = getFirebaseAuth();
    const user = auth?.currentUser;

    if (!user) {
        console.warn('authenticatedFetch: No user logged in');
    }

    const token = user ? await user.getIdToken() : null;

    const headers = new Headers(options.headers);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(url, { ...options, headers });
}
