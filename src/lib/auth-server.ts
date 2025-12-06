import { auth } from '@/lib/firebase/admin';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Verifies the Firebase ID token from the Authorization header.
 * @param request The incoming request object.
 * @returns The decoded ID token if valid, or null if not.
 * @throws Error if the Authorization header is missing or invalid format.
 */
export async function verifyAuth(request: Request): Promise<DecodedIdToken | null> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null; // Or throw specific error if you want to distinguish missing vs invalid
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        if (!auth) {
            throw new Error('Firebase Admin Auth not initialized');
        }
        const decodedToken = await auth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return null;
    }
}
