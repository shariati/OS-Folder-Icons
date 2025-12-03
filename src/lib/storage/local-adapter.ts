import fs from 'fs/promises';
import path from 'path';
import { StorageAdapter } from './types';

export const localStorageAdapter: StorageAdapter = {
    async uploadFile(file: File | Buffer, filename: string, folder: string = 'uploads'): Promise<string> {
        const buffer = Buffer.isBuffer(file) ? file : Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), 'public', folder);

        try {
            await fs.mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        await fs.writeFile(path.join(uploadDir, filename), buffer);
        return `/${folder}/${filename}`;
    },

    async deleteFile(url: string): Promise<void> {
        // url is like /uploads/filename.ext or /blogs/filename.ext
        const filePath = path.join(process.cwd(), 'public', url);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error('Error deleting local file:', error);
        }
    }
};
