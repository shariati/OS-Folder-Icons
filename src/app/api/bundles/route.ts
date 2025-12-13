import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { getDB, saveDB } from '@/lib/db';
import { Bundle } from '@/lib/types';

export async function GET() {
  const db = await getDB();
  return NextResponse.json(db.bundles);
}

export async function POST(request: Request) {
  const db = await getDB();
  const body = await request.json();

  if (!body.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const newBundle: Bundle = {
    id: uuidv4(),
    name: body.name,
    description: body.description || '',
    tags: body.tags || [],
    previewImage: body.previewImage,
    targetOS: body.targetOS || [],
    icons: body.icons || [],
  };

  db.bundles.push(newBundle);
  await saveDB(db);

  return NextResponse.json(newBundle);
}
