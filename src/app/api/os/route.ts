import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';
import { OperatingSystem } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const db = await getDB();
    return NextResponse.json(db.operatingSystems);
}

export async function POST(request: Request) {
    const db = await getDB();
    const body = await request.json();

    // Basic validation
    if (!body.name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newOS: OperatingSystem = {
        id: body.id || uuidv4(),
        name: body.name,
        image: body.image,
        versions: body.versions || []
    };

    db.operatingSystems.push(newOS);
    await saveDB(db);

    return NextResponse.json(newOS);
}
