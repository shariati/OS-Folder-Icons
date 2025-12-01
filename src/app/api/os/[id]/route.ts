import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';
import { OperatingSystem } from '@/lib/types';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const db = await getDB();
    const body = await request.json();

    const osIndex = db.operatingSystems.findIndex(os => os.id === id);
    if (osIndex === -1) {
        return NextResponse.json({ error: 'OS not found' }, { status: 404 });
    }

    // Update fields
    const updatedOS = { ...db.operatingSystems[osIndex], ...body };
    db.operatingSystems[osIndex] = updatedOS;

    await saveDB(db);

    return NextResponse.json(updatedOS);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const db = await getDB();

    const osIndex = db.operatingSystems.findIndex(os => os.id === id);
    if (osIndex === -1) {
        return NextResponse.json({ error: 'OS not found' }, { status: 404 });
    }

    db.operatingSystems.splice(osIndex, 1);
    await saveDB(db);

    return NextResponse.json({ success: true });
}
