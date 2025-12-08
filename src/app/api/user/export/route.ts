import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { headers } from 'next/headers';

export async function GET() {
    try {
        const headersList = await headers();
        const authHeader = headersList.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify the Firebase token
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        // Fetch user profile from Firestore
        const userDoc = await adminDb.collection('users').doc(uid).get();
        const userData = userDoc.exists ? userDoc.data() : null;

        // Fetch user's saved configurations (if any)
        const configurationsSnapshot = await adminDb
            .collection('users')
            .doc(uid)
            .collection('configurations')
            .get();

        const configurations = configurationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Fetch user's saved bundles/favorites (if any)
        const favoritesSnapshot = await adminDb
            .collection('users')
            .doc(uid)
            .collection('favorites')
            .get();

        const favorites = favoritesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Compile all user data
        const exportData = {
            exportDate: new Date().toISOString(),
            exportedBy: 'HD Pick',
            user: {
                uid: uid,
                email: decodedToken.email || null,
                displayName: userData?.displayName || decodedToken.name || null,
                photoURL: userData?.photoURL || decodedToken.picture || null,
                role: userData?.role || 'free',
                createdAt: userData?.createdAt || null,
                lastLoginAt: userData?.lastLoginAt || null,
            },
            profile: userData ? {
                displayName: userData.displayName,
                photoURL: userData.photoURL,
                role: userData.role,
                subscriptionStatus: userData.subscriptionStatus || null,
                stripeCustomerId: userData.stripeCustomerId ? '[REDACTED]' : null,
                planId: userData.planId || null,
                currentPeriodEnd: userData.currentPeriodEnd || null,
            } : null,
            savedConfigurations: configurations,
            favorites: favorites,
            privacyNote: 'This export contains all personal data we have stored about you. For questions, contact us via GitHub Discussions.',
        };

        return NextResponse.json(exportData);
    } catch (error: any) {
        console.error('Data export error:', error);

        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Token expired. Please log in again.' }, { status: 401 });
        }

        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}
