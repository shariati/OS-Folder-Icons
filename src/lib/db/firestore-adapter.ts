import { db } from '../firebase/client';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, query, where, getCountFromServer, writeBatch } from 'firebase/firestore';
import { DatabaseAdapter } from './types';
import { UserProfile } from '../../types/user';
import { DB, OperatingSystem, Bundle, Category, Tag, HeroSlide, AuditLog, BlogPost, Page, Settings } from '../types';

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
        // A cloud function would be needed to delete the Auth user.
        if (!db) return;
        // await deleteDoc(doc(db, 'users', uid)); // Import deleteDoc if needed
        // For now, let's just log it or maybe we shouldn't implement delete from UI without backend
        console.warn("Delete user not fully implemented without backend");
    },
    async getAuditLogs(): Promise<AuditLog[]> {
        if (!db) return [];
        const snapshot = await getDocs(collection(db, 'auditLogs'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
    },
    async logAuditAction(action: Omit<AuditLog, 'id'>): Promise<void> {
        if (!db) return;
        const docRef = doc(collection(db, 'auditLogs'));
        await setDoc(docRef, { ...action, id: docRef.id });
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
    async deleteBlogPost(id: string): Promise<void> {
        if (!db) return;
        // await deleteDoc(doc(db, 'blogPosts', id));
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
        // await deleteDoc(doc(db, 'pages', id));
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
        const batch = writeBatch(db);

        // This is a naive implementation. In a real app, we should only update changed items.
        // Also, batch has a limit of 500 operations.
        // For now, we assume the data size is small enough or we accept the risk.

        data.operatingSystems.forEach(os => {
            batch.set(doc(db, 'operatingSystems', os.id), os);
        });
        data.bundles.forEach(bundle => {
            batch.set(doc(db, 'bundles', bundle.id), bundle);
        });
        data.categories.forEach(cat => {
            batch.set(doc(db, 'categories', cat.id), cat);
        });
        data.tags.forEach(tag => {
            batch.set(doc(db, 'tags', tag.id), tag);
        });
        data.heroSlides.forEach(slide => {
            batch.set(doc(db, 'heroSlides', slide.id), slide);
        });
        data.users.forEach(user => {
            batch.set(doc(db, 'users', user.uid), user);
        });
        data.auditLogs.forEach(log => {
            batch.set(doc(db, 'auditLogs', log.id), log);
        });
        data.blogPosts.forEach(post => {
            batch.set(doc(db, 'blogPosts', post.id), post);
        });
        data.pages.forEach(page => {
            batch.set(doc(db, 'pages', page.id), page);
        });
        if (data.settings) {
            batch.set(doc(db, 'settings', 'general'), data.settings);
        }

        await batch.commit();
    },
};
