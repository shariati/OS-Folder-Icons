import { NextResponse } from 'next/server';
import { getDB, saveOperatingSystem } from '@/lib/db';
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
        versions: body.versions || [],
        brandIcon: body.brandIcon,
        format: body.format || 'png'
    };

    await saveOperatingSystem(newOS);

    return NextResponse.json(newOS);
}
