import fs from 'fs/promises';
import path from 'path';
import { DB } from './types';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

export async function getDB(): Promise<DB> {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty DB
        return { operatingSystems: [], bundles: [], categories: [], tags: [], heroSlides: [] };
    }
}

export async function saveDB(db: DB): Promise<void> {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}
