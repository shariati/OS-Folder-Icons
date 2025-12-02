import { db } from '../firebase/client';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, query, where, getCountFromServer, writeBatch } from 'firebase/firestore';
import { DatabaseAdapter } from './types';
import { UserProfile } from '../../types/user';
import { DB, OperatingSystem, Bundle, Category, Tag, HeroSlide } from '../types';

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
    async getLifetimeUserCount(): Promise<number> {
        if (!db) return 0;
        const q = query(collection(db, 'users'), where('role', '==', 'lifetime'));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    },
    async getDB(): Promise<DB> {
        if (!db) return { operatingSystems: [], bundles: [], categories: [], tags: [], heroSlides: [] };
        const [operatingSystems, bundles, categories, tags, heroSlides] = await Promise.all([
            this.getOperatingSystems(),
            this.getBundles(),
            this.getCategories(),
            this.getTags(),
            this.getHeroSlides(),
        ]);
        return { operatingSystems, bundles, categories, tags, heroSlides };
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

        await batch.commit();
    },
};
