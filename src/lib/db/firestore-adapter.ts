import { db } from '../firebase/client';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getCountFromServer, writeBatch } from 'firebase/firestore';
import { DatabaseAdapter } from './types';
import { UserProfile } from '../../types/user';
import { DB, OperatingSystem, Bundle, Category, Tag, HeroSlide, BlogPost, Page, Settings } from '../types';

export const firestoreAdapter: DatabaseAdapter = {
    async getOperatingSystems(): Promise<OperatingSystem[]> {
        if (!db) return [];
        const snapshot = await getDocs(collection(db, 'operatingSystems'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OperatingSystem));
    },
    async getBundles(): Promise<Bundle[]> {
        if (!db) return [];
        const snapshot = await getDocs(collection(db, 'bundles'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bundle));
    },
    async getCategories(): Promise<Category[]> {
        if (!db) return [];
        const snapshot = await getDocs(collection(db, 'categories'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    },
    async getTags(): Promise<Tag[]> {
        if (!db) return [];
        const snapshot = await getDocs(collection(db, 'tags'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag));
    },
    async getHeroSlides(): Promise<HeroSlide[]> {
        if (!db) return [];
        const snapshot = await getDocs(collection(db, 'heroSlides'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeroSlide));
    },
    async getUser(uid: string): Promise<UserProfile | null> {
        if (!db) return null;
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    },
    async createUser(user: UserProfile): Promise<void> {
        if (!db) return;
        await setDoc(doc(db, 'users', user.uid), user);
    },
    async updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
        if (!db) return;
        await updateDoc(doc(db, 'users', uid), data);
    },
    async getUsers(): Promise<UserProfile[]> {
        if (!db) return [];
        const snapshot = await getDocs(collection(db, 'users'));
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    },
    async deleteUser(uid: string): Promise<void> {
        // Note: Deleting users from client-side Auth is not possible directly.
        // This only deletes the user profile document.
        if (!db) return;
        await deleteDoc(doc(db, 'users', uid));
    },
    async getBlogPosts(): Promise<BlogPost[]> {
        if (!db) return [];
        const snapshot = await getDocs(collection(db, 'blogPosts'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    },
    async saveBlogPost(post: BlogPost): Promise<void> {
        if (!db) return;
        await setDoc(doc(db, 'blogPosts', post.id), post);
    },
    async updateBlogPost(id: string, data: Partial<BlogPost>): Promise<void> {
        if (!db) return;
        await updateDoc(doc(db, 'blogPosts', id), data);
    },
    async deleteBlogPost(id: string): Promise<void> {
        if (!db) return;
        await deleteDoc(doc(db, 'blogPosts', id));
    },
    async getPages(): Promise<Page[]> {
        if (!db) return [];
        const snapshot = await getDocs(collection(db, 'pages'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
    },
    async savePage(page: Page): Promise<void> {
        if (!db) return;
        await setDoc(doc(db, 'pages', page.id), page);
    },
    async deletePage(id: string): Promise<void> {
        if (!db) return;
        await deleteDoc(doc(db, 'pages', id));
    },
    async getSettings(): Promise<Settings> {
        if (!db) return {};
        const docSnap = await getDoc(doc(db, 'settings', 'general'));
        if (docSnap.exists()) {
            return docSnap.data() as Settings;
        }
        return {};
    },
    async saveSettings(settings: Settings): Promise<void> {
        if (!db) return;
        await setDoc(doc(db, 'settings', 'general'), settings);
    },
    async getLifetimeUserCount(): Promise<number> {
        if (!db) return 0;
        const q = query(collection(db, 'users'), where('role', '==', 'lifetime'));
        const snapshot = await getCountFromServer(q);
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
            blogPosts: [],
            pages: [],
            settings: {}
        };
        const [operatingSystems, bundles, categories, tags, heroSlides, users, blogPosts, pages, settings] = await Promise.all([
            this.getOperatingSystems(),
            this.getBundles(),
            this.getCategories(),
            this.getTags(),
            this.getHeroSlides(),
            this.getUsers(),
            this.getBlogPosts(),
            this.getPages(),
            this.getSettings(),
        ]);
        return { operatingSystems, bundles, categories, tags, heroSlides, users, blogPosts, pages, settings };
    },
    async saveDB(data: DB): Promise<void> {
        if (!db) return;

        const BATCH_LIMIT = 500;
        let batch = writeBatch(db);
        let operationCount = 0;

        const commitBatchIfFull = async () => {
            if (operationCount >= BATCH_LIMIT) {
                await batch.commit();
                batch = writeBatch(db);
                operationCount = 0;
            }
        };

        const addToBatch = async (docRef: any, data: any) => {
            batch.set(docRef, data);
            operationCount++;
            await commitBatchIfFull();
        };

        for (const os of data.operatingSystems) {
            await addToBatch(doc(db, 'operatingSystems', os.id), os);
        }
        for (const bundle of data.bundles) {
            await addToBatch(doc(db, 'bundles', bundle.id), bundle);
        }
        for (const cat of data.categories) {
            await addToBatch(doc(db, 'categories', cat.id), cat);
        }
        for (const tag of data.tags) {
            await addToBatch(doc(db, 'tags', tag.id), tag);
        }
        for (const slide of data.heroSlides) {
            await addToBatch(doc(db, 'heroSlides', slide.id), slide);
        }
        for (const user of data.users) {
            await addToBatch(doc(db, 'users', user.uid), user);
        }
        for (const post of data.blogPosts) {
            await addToBatch(doc(db, 'blogPosts', post.id), post);
        }
        for (const page of data.pages) {
            await addToBatch(doc(db, 'pages', page.id), page);
        }
        if (data.settings) {
            await addToBatch(doc(db, 'settings', 'general'), data.settings);
        }

        if (operationCount > 0) {
            await batch.commit();
        }
    },
};
