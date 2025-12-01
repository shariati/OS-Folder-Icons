import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');

    try {
        await writeFile(path.join(uploadDir, filename), buffer);
        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
