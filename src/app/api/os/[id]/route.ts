import { NextResponse } from 'next/server';
import { getOperatingSystem, saveOperatingSystem, deleteOperatingSystem } from '@/lib/db';
import { OperatingSystem } from '@/lib/types';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();

    // Fetch only the specific OS
    const currentOS = await getOperatingSystem(id);
    if (!currentOS) {
        return NextResponse.json({ error: 'OS not found' }, { status: 404 });
    }

    // Merge updates
    const updatedOS: OperatingSystem = { ...currentOS, ...body, id }; // Ensure ID matches

    // Clean up potential undefined values (though saveOperatingSystem handles this too now)
    if ((updatedOS as any).image === undefined) delete (updatedOS as any).image;

    await saveOperatingSystem(updatedOS);

    return NextResponse.json(updatedOS);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Direct delete without pre-fetching entire DB. 
    // Firestore delete is successful even if doc doesn't exist.
    await deleteOperatingSystem(id);

    return NextResponse.json({ success: true });
}
