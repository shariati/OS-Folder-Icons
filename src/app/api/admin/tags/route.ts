import { NextRequest, NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';
import { Tag } from '@/lib/types';
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return unauthorizedResponse();

  try {
    const db = await getDB();
    const tag: Tag = await request.json();

    if (!tag.id || !tag.name || !tag.slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    db.tags.push(tag);
    await saveDB(db);

    return NextResponse.json(tag);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return unauthorizedResponse();

  try {
    const db = await getDB();
    const tag: Tag = await request.json();

    const index = db.tags.findIndex((t) => t.id === tag.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    db.tags[index] = tag;
    await saveDB(db);

    return NextResponse.json(tag);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const db = await getDB();
    const index = db.tags.findIndex((t) => t.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    db.tags.splice(index, 1);
    await saveDB(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
