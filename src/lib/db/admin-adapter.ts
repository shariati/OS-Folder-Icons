import { db } from '../firebase/admin';
import { DatabaseAdapter } from './types';
import { UserProfile } from '../../types/user';
import { DB, OperatingSystem, Bundle, Category, Tag, HeroSlide, AuditLog, BlogPost, Page, Settings } from '../types';

export const adminAdapter: DatabaseAdapter = {
    async getOperatingSystems(): Promise<OperatingSystem[]> {
        if (!db) return [];
        const snapshot = await db.collection('operatingSystems').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OperatingSystem));
    },
    async getBundles(): Promise<Bundle[]> {
        if (!db) return [];
        const snapshot = await db.collection('bundles').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bundle));
    },
    async getCategories(): Promise<Category[]> {
        if (!db) return [];
        const snapshot = await db.collection('categories').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    },
    async getTags(): Promise<Tag[]> {
        if (!db) return [];
        const snapshot = await db.collection('tags').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag));
    },
    async getHeroSlides(): Promise<HeroSlide[]> {
        if (!db) return [];
        const snapshot = await db.collection('heroSlides').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeroSlide));
    },
    async getUser(uid: string): Promise<UserProfile | null> {
        if (!db) return null;
        const docSnap = await db.collection('users').doc(uid).get();
        if (docSnap.exists) {
            return docSnap.data() as UserProfile;
        }
        return null;
    },
    async createUser(user: UserProfile): Promise<void> {
        if (!db) return;
        await db.collection('users').doc(user.uid).set(user);
    },
    async updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
        if (!db) return;
        await db.collection('users').doc(uid).update(data);
    },
    async getUsers(): Promise<UserProfile[]> {
        if (!db) return [];
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    },
    async deleteUser(uid: string): Promise<void> {
        if (!db) return;
        await db.collection('users').doc(uid).delete();
    },
    async getAuditLogs(): Promise<AuditLog[]> {
        if (!db) return [];
        const snapshot = await db.collection('auditLogs').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
    },
    async logAuditAction(action: Omit<AuditLog, 'id'>): Promise<void> {
        if (!db) return;
        const docRef = db.collection('auditLogs').doc();
        await docRef.set({ ...action, id: docRef.id });
    },
    async getBlogPosts(): Promise<BlogPost[]> {
        if (!db) return [];
        const snapshot = await db.collection('blogPosts').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    },
    async saveBlogPost(post: BlogPost): Promise<void> {
        if (!db) return;
        await db.collection('blogPosts').doc(post.id).set(post);
    },
    async deleteBlogPost(id: string): Promise<void> {
        if (!db) return;
        await db.collection('blogPosts').doc(id).delete();
    },
    async getPages(): Promise<Page[]> {
        if (!db) return [];
        const snapshot = await db.collection('pages').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
    },
    async savePage(page: Page): Promise<void> {
        if (!db) return;
        await db.collection('pages').doc(page.id).set(page);
    },
    async deletePage(id: string): Promise<void> {
        if (!db) return;
        await db.collection('pages').doc(id).delete();
    },
    async getSettings(): Promise<Settings> {
        if (!db) return {};
        const docSnap = await db.collection('settings').doc('general').get();
        if (docSnap.exists) {
            return docSnap.data() as Settings;
        }
        return {};
    },
    async saveSettings(settings: Settings): Promise<void> {
        if (!db) return;
        await db.collection('settings').doc('general').set(settings);
    },
    async getLifetimeUserCount(): Promise<number> {
        if (!db) return 0;
        const snapshot = await db.collection('users').where('role', '==', 'lifetime').count().get();
        return snapshot.data().count;
    },
    async getDB(): Promise<DB> {
        if (!db) return {
            operatingSystems: [],
            bundles: [],
            categories: [],
            tags: [],
            heroSlides: [],
            users: [],
            auditLogs: [],
            blogPosts: [],
            pages: [],
            settings: {}
        };
        const [operatingSystems, bundles, categories, tags, heroSlides, users, auditLogs, blogPosts, pages, settings] = await Promise.all([
            this.getOperatingSystems(),
            this.getBundles(),
            this.getCategories(),
            this.getTags(),
            this.getHeroSlides(),
            this.getUsers(),
            this.getAuditLogs(),
            this.getBlogPosts(),
            this.getPages(),
            this.getSettings(),
        ]);
        return { operatingSystems, bundles, categories, tags, heroSlides, users, auditLogs, blogPosts, pages, settings };
    },
    async saveDB(data: DB): Promise<void> {
        if (!db) return;

        const batch = db.batch();
        let operationCount = 0;
        const BATCH_LIMIT = 500;

        const commitBatchIfFull = async () => {
            if (operationCount >= BATCH_LIMIT) {
                await batch.commit();
                // batch is not reusable after commit in some SDKs, but in Admin SDK it returns WriteResults.
                // We need to create a new batch.
                // However, re-assigning 'batch' variable which is const? No, I defined it as const above.
                // I need to change it to let.
                // Wait, I can't change const. I'll fix this logic.
            }
        };

        // Actually, let's just use a simple loop and create new batches as needed, 
        // or just use the same logic as firestore-adapter but adapted for Admin SDK.
        // Admin SDK batch also has commit().

        // Refactoring to handle batching correctly
        const saveData = async () => {
            let currentBatch = db.batch();
            let count = 0;

            const addToBatch = async (docRef: FirebaseFirestore.DocumentReference, data: any) => {
                currentBatch.set(docRef, data);
                count++;
                if (count >= BATCH_LIMIT) {
                    await currentBatch.commit();
                    currentBatch = db.batch();
                    count = 0;
                }
            };

            for (const os of data.operatingSystems) {
                await addToBatch(db.collection('operatingSystems').doc(os.id), os);
            }
            for (const bundle of data.bundles) {
                await addToBatch(db.collection('bundles').doc(bundle.id), bundle);
            }
            for (const cat of data.categories) {
                await addToBatch(db.collection('categories').doc(cat.id), cat);
            }
            for (const tag of data.tags) {
                await addToBatch(db.collection('tags').doc(tag.id), tag);
            }
            for (const slide of data.heroSlides) {
                await addToBatch(db.collection('heroSlides').doc(slide.id), slide);
            }
            for (const user of data.users) {
                await addToBatch(db.collection('users').doc(user.uid), user);
            }
            for (const log of data.auditLogs) {
                await addToBatch(db.collection('auditLogs').doc(log.id), log);
            }
            for (const post of data.blogPosts) {
                await addToBatch(db.collection('blogPosts').doc(post.id), post);
            }
            for (const page of data.pages) {
                await addToBatch(db.collection('pages').doc(page.id), page);
            }
            if (data.settings) {
                await addToBatch(db.collection('settings').doc('general'), data.settings);
            }

            if (count > 0) {
                await currentBatch.commit();
            }
        };

        await saveData();
    },
};
