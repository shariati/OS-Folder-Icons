import { getAuth } from 'firebase/auth';
import { getFirebaseAuth } from './firebase/client';

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
    // Ensure auth is initialized
    const auth = getFirebaseAuth();
    const user = auth?.currentUser;

    if (!user) {
        console.warn('authenticatedFetch: No user logged in');
    }

    let token = null;
    if (user) {
        try {
            // Force refresh if this is an admin request to ensure we have latest claims
            const forceRefresh = url.includes('/api/admin');
            token = await user.getIdToken(forceRefresh);
        } catch (err) {
            console.error('authenticatedFetch: Failed to get ID token', err);
        }
    }

    const headers = new Headers(options.headers);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        console.log('authenticatedFetch: adding Authorization header', token.substring(0, 10) + '...');
    } else {
        console.warn('authenticatedFetch: No token available for user', user?.uid);
    }

    return fetch(url, { ...options, headers });
}
