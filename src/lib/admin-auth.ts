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
        // and we might check their role from Firestore or Claims.

        // Check for admin role claim if it exists
        if (decodedToken.role !== 'admin' && decodedToken.admin !== true) {
            // Fallback: check email if you have hardcoded admins (temporary)
            // or fetch user from DB. 
            // For production readiness, we should rely on Custom Claims 'role' === 'admin'.
            // Best practice: Set Custom Claims on login/update.

            // STRICT ENFORCEMENT for Security Audit Fix
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
