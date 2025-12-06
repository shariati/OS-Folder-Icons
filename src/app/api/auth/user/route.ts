import { NextResponse } from 'next/server';
import { getUser, createUser, updateUser, deleteUser } from '@/lib/db';
import { UserProfile } from '@/types/user';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { uid, email, displayName, photoURL, providers } = body;

        if (!uid) {
            return NextResponse.json({ error: 'Missing UID' }, { status: 400 });
        }

        let profile = await getUser(uid);

        if (!profile) {
            profile = {
                uid,
                email,
                displayName,
                photoURL,
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
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json({ error: 'Missing UID' }, { status: 400 });
        }

        await deleteUser(uid);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
