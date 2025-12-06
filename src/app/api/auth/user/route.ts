import { NextResponse } from 'next/server';
import { getUser, createUser, updateUser, deleteUser } from '@/lib/db';
import { UserProfile } from '@/types/user';
import { verifyAuth } from '@/lib/auth-server';

export async function POST(request: Request) {
    try {
        const decodedToken = await verifyAuth(request);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const authUid = decodedToken.uid;

        const body = await request.json();
        const { displayName, photoURL, providers } = body;

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
            };
            await createUser(profile);
        } else {
            // Update existing profile with new info if provided
            const updates: Partial<UserProfile> = {};
            if (displayName) updates.displayName = displayName;
            if (photoURL) updates.photoURL = photoURL;
            if (providers) updates.providers = providers;

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
