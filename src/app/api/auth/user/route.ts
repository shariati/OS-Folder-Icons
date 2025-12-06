import { NextResponse } from 'next/server';
import { getUser, createUser, updateUser, deleteUser } from '@/lib/db';
import { UserProfile } from '@/types/user';
import { verifyAuth } from '@/lib/auth-server';
import { adminAuth as auth } from '@/lib/firebase/admin';

export async function POST(request: Request) {
    try {
        if (!auth) {
            console.error('Firebase Admin Auth is not initialized. Missing FIREBASE_SERVICE_ACCOUNT_KEY?');
            return NextResponse.json({ error: 'Server misconfiguration: Firebase Admin not initialized' }, { status: 500 });
        }

        const decodedToken = await verifyAuth(request);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const authUid = decodedToken.uid;

        const body = await request.json();
        const { displayName, photoURL, providers, emailVerified, activationEmailSentAt } = body;

        // Ensure we are operating on the authenticated user
        // We can ignore body.uid or verify it matches authUid
        const uid = authUid;

        let profile = await getUser(uid);

        if (!profile) {
            // Check if email matches token email for extra safety on creation
            // (Though Firebase ID token guarantees email claim usually)
            const email = decodedToken.email || body.email;

            profile = {
                uid,
                email,
                displayName: displayName || decodedToken.name || '',
                photoURL: photoURL || decodedToken.picture || '',
                providers: providers || [],
                role: 'free',
                createdAt: new Date().toISOString(),
                emailVerified: emailVerified || false,
                activationEmailSentAt: activationEmailSentAt || undefined,
            };
            await createUser(profile);
        } else {
            // Update existing profile with new info if provided
            const updates: Partial<UserProfile> = {};
            if (displayName && displayName !== profile.displayName) updates.displayName = displayName;
            if (photoURL && photoURL !== profile.photoURL) updates.photoURL = photoURL;
            if (providers) updates.providers = providers;

            // Handle email verification status
            if (emailVerified !== undefined && emailVerified !== profile.emailVerified) {
                updates.emailVerified = emailVerified;
                // If email is now verified and wasn't before, set activatedAt
                if (emailVerified && !profile.emailVerified && !profile.activatedAt) {
                    updates.activatedAt = new Date().toISOString();
                }
            }

            // Update activation email sent timestamp if provided
            if (activationEmailSentAt) {
                updates.activationEmailSentAt = activationEmailSentAt;
            }

            // Auto-activate existing users who don't have emailVerified set (migration)
            if (profile.emailVerified === undefined && emailVerified === undefined) {
                updates.emailVerified = true;
                updates.activatedAt = profile.createdAt; // Use their creation date as activation date
            }

            // Always update from body if provided to keep local state in sync or update if missing
            // But be careful not to overwrite with nulls if we want to keep existing data
            // Actually, we should probably merge providers if possible, but replacing is easier for sync.

            if (Object.keys(updates).length > 0) {
                await updateUser(uid, updates);
                // Merge updates into profile object for response
                profile = { ...profile, ...updates };
            }
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Error in /api/auth/user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const decodedToken = await verifyAuth(request);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const uidToDelete = searchParams.get('uid');

        // Only allow users to delete themselves
        if (!uidToDelete || uidToDelete !== decodedToken.uid) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await deleteUser(decodedToken.uid);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
