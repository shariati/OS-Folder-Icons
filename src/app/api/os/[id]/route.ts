import { NextResponse } from 'next/server';

import { deleteOperatingSystem, getOperatingSystem, saveOperatingSystem } from '@/lib/db';
import { OperatingSystem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  // Fetch only the specific OS
  const currentOS = await getOperatingSystem(id);
  if (!currentOS) {
    return NextResponse.json({ error: 'OS not found' }, { status: 404 });
  }

  // Merge updates
  const updatedOS: OperatingSystem = { ...currentOS, ...body, id }; // Ensure ID matches

  try {
    await saveOperatingSystem(updatedOS);
  } catch (error) {
    console.error('Error saving OS:', error);
    return NextResponse.json({ error: 'Failed to save OS to database' }, { status: 500 });
  }

  return NextResponse.json(updatedOS);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Direct delete without pre-fetching entire DB.
  // Firestore delete is successful even if doc doesn't exist.
  await deleteOperatingSystem(id);

  return NextResponse.json({ success: true });
}
