import { NextRequest, NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';
import { Category } from '@/lib/types';
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();

    try {
        const db = await getDB();
        const category: Category = await request.json();

        // Basic validation
        if (!category.id || !category.name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        db.categories.push(category);
        await saveDB(db);

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) return unauthorizedResponse();

    try {
        const db = await getDB();
        const category: Category = await request.json();

        const index = db.categories.findIndex(c => c.id === category.id);
        if (index === -1) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        db.categories[index] = category;
        await saveDB(db);

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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
        const index = db.categories.findIndex(c => c.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        db.categories.splice(index, 1);
        await saveDB(db);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
