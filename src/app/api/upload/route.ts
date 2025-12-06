import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

import { verifyAuth } from '@/lib/auth-server';
import { getUser } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const decodedToken = await verifyAuth(request);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'uploads'; // Default to uploads

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate folder to prevent arbitrary path traversal or unwanted folders
        const allowedFolders = ['blogs', 'pages', 'uploads'];
        let targetFolder = allowedFolders.includes(folder) ? folder : 'uploads';

        // Additional Security: Only admins can upload to 'blogs' or 'pages'
        if (targetFolder === 'blogs' || targetFolder === 'pages') {
            const userProfile = await getUser(decodedToken.uid);
            if (userProfile?.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden: Admin access required for this folder' }, { status: 403 });
            }
        }

        const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

        const url = await uploadFile(file, filename, targetFolder);

        return NextResponse.json({ url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
