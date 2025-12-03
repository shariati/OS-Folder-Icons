import { NextResponse } from 'next/server';
import { getUser, createUser } from '@/lib/db';
import { UserProfile } from '@/types/user';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { uid, email, displayName, photoURL } = body;

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
                role: 'free',
                createdAt: new Date().toISOString(),
            };
            await createUser(profile);
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Error in /api/auth/user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
