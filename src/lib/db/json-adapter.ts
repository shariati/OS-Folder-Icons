import fs from 'fs/promises';
import path from 'path';
import { DatabaseAdapter, DatabaseSchema } from './types';
import { UserProfile } from '../../types/user';
import { DB, OperatingSystem, Bundle, Category, Tag, HeroSlide } from '../types';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

async function readDb(): Promise<DatabaseSchema> {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

export const jsonAdapter: DatabaseAdapter = {
    async getOperatingSystems(): Promise<OperatingSystem[]> {
        const db = await readDb();
        return db.operatingSystems;
    },
    async getBundles(): Promise<Bundle[]> {
        const db = await readDb();
        return db.bundles;
    },
    async getCategories(): Promise<Category[]> {
        const db = await readDb();
        return db.categories;
    },
    async getTags(): Promise<Tag[]> {
        const db = await readDb();
        return db.tags;
    },
    async getHeroSlides(): Promise<HeroSlide[]> {
        const db = await readDb();
        return db.heroSlides || [];
    },
    async getUser(uid: string): Promise<UserProfile | null> {
        const db = await readDb();
        return db.users?.find(u => u.uid === uid) || null;
    },
    async createUser(user: UserProfile): Promise<void> {
        const db = await readDb();
        if (!db.users) db.users = [];
        db.users.push(user);
        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    },
    async updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
        const db = await readDb();
        if (!db.users) return;
        const index = db.users.findIndex(u => u.uid === uid);
        if (index !== -1) {
            db.users[index] = { ...db.users[index], ...data };
            await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
        }
    },
    async getLifetimeUserCount(): Promise<number> {
        const db = await readDb();
        return db.users?.filter(u => u.role === 'lifetime').length || 0;
    },
    async getDB(): Promise<DB> {
        const db = await readDb();
        return db;
    },
    async saveDB(data: DB): Promise<void> {
        // Preserve users if they exist in file but not in data (if data comes from legacy code that doesn't know about users)
        // But legacy code uses getDB which returns DB (without users in type definition in legacy code, but runtime has it).
        // Actually DB type in types.ts doesn't have users.
        // So we need to be careful not to lose users.
        const currentDb = await readDb();
        const newDb = { ...data, users: currentDb.users };
        await fs.writeFile(DB_PATH, JSON.stringify(newDb, null, 2));
    },
};
