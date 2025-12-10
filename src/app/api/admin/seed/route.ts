import { NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase/admin';
import fs from 'fs/promises';
import path from 'path';
import { DatabaseSchema } from '@/lib/db/types';

export async function POST(request: Request) {
  try {
    // Disable in production unless explicitly enabled
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_SEED_ROUTE !== 'true') {
      return NextResponse.json({ error: 'Seed route disabled in production' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.SEED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbPath = path.join(process.cwd(), 'src/data/db.json');
    const data = await fs.readFile(dbPath, 'utf-8');
    const jsonData: DatabaseSchema = JSON.parse(data);

    if (!db) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const batch = db.batch();

    // Seed Operating Systems
    for (const os of jsonData.operatingSystems) {
      const ref = db.collection('operatingSystems').doc(os.id);
      batch.set(ref, os);
    }

    // Seed Bundles
    for (const bundle of jsonData.bundles) {
      const ref = db.collection('bundles').doc(bundle.id);
      batch.set(ref, bundle);
    }

    // Seed Categories
    for (const category of jsonData.categories) {
      const ref = db.collection('categories').doc(category.id);
      batch.set(ref, category);
    }

    // Seed Tags
    for (const tag of jsonData.tags) {
      const ref = db.collection('tags').doc(tag.id);
      batch.set(ref, tag);
    }

    // Seed Hero Slides
    for (const slide of jsonData.heroSlides) {
      const ref = db.collection('heroSlides').doc(slide.id);
      batch.set(ref, slide);
    }

    await batch.commit();

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
