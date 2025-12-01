import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const db = await getDB();
    const body = await request.json();

    const index = db.bundles.findIndex(b => b.id === id);
    if (index === -1) {
        return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    const updatedBundle = { ...db.bundles[index], ...body };
    db.bundles[index] = updatedBundle;

    await saveDB(db);

    return NextResponse.json(updatedBundle);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const db = await getDB();

    const index = db.bundles.findIndex(b => b.id === id);
    if (index === -1) {
        return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    db.bundles.splice(index, 1);
    await saveDB(db);

    return NextResponse.json({ success: true });
}
