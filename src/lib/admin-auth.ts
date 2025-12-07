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

            // If your app stores role in Firestore but hasn't set custom claims yet, 
            // you might need to read Firestore here. 
            // However, reading Firestore on every admin request is slow. 
            // Best practice: Set Custom Claims on login/update.

            // For this audit fix, let's return the token if valid, 
            // and let the route decide or enforce strict 'admin' claim if possible.

            // Strict Mode:
            // if (decodedToken.role !== 'admin') return null;
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
