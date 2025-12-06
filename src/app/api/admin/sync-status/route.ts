import { NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase/admin';

export async function GET() {
    try {
        const doc = await db.collection('system').doc('sync-status').get();
        if (doc.exists) {
            return NextResponse.json(doc.data());
        }
        return NextResponse.json({ lastSyncDate: null });
    } catch (error) {
        console.error('Error fetching sync status:', error);
        return NextResponse.json({ error: 'Failed to fetch sync status' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { lastSyncDate } = await req.json();
        await db.collection('system').doc('sync-status').set({
            lastSyncDate,
            updatedAt: new Date().toISOString(),
        }, { merge: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating sync status:', error);
        return NextResponse.json({ error: 'Failed to update sync status' }, { status: 500 });
    }
}
