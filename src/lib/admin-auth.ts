import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function verifyAdmin(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Initial check: just valid token. 
        // Ideally check custom claims for 'admin' role if your app uses them.
        // For now, let's assume if they have a valid token they are a user, 
        console.log('Admin Auth Check:', {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role,
            adminClaim: decodedToken.admin
        });

        if (decodedToken.role !== 'admin' && decodedToken.admin !== true) {
            console.error('Admin verification failed: Missing admin role');
            return null;
        }

        return decodedToken;
    } catch (error) {
        console.error('verifyAdmin error:', error);
        return null;
    }
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
