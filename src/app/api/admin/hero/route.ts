import { NextRequest, NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';
import { HeroSlide } from '@/lib/types';
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return unauthorizedResponse();

  try {
    const db = await getDB();
    const slide: HeroSlide = await request.json();

    if (!slide.id || !slide.title || !slide.imageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!db.heroSlides) db.heroSlides = [];
    db.heroSlides.push(slide);
    await saveDB(db);

    return NextResponse.json(slide);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return unauthorizedResponse();

  try {
    const db = await getDB();
    const slide: HeroSlide = await request.json();

    if (!db.heroSlides) db.heroSlides = [];
    const index = db.heroSlides.findIndex((s) => s.id === slide.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }

    db.heroSlides[index] = slide;
    await saveDB(db);

    return NextResponse.json(slide);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
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
    if (!db.heroSlides) return NextResponse.json({ error: 'Slide not found' }, { status: 404 });

    const index = db.heroSlides.findIndex((s) => s.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }

    db.heroSlides.splice(index, 1);
    await saveDB(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
  }
}
