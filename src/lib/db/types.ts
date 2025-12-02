import { DB, OperatingSystem, Bundle, Category, Tag, HeroSlide } from '../types';
import { UserProfile } from '../../types/user';

export interface DatabaseSchema extends DB {
    users?: UserProfile[];
}

export interface DatabaseAdapter {
    getOperatingSystems(): Promise<OperatingSystem[]>;
    getBundles(): Promise<Bundle[]>;
    getCategories(): Promise<Category[]>;
    getTags(): Promise<Tag[]>;
    getHeroSlides(): Promise<HeroSlide[]>;
    getUser(uid: string): Promise<UserProfile | null>;
    createUser(user: UserProfile): Promise<void>;
    updateUser(uid: string, data: Partial<UserProfile>): Promise<void>;
    getLifetimeUserCount(): Promise<number>;
    getDB(): Promise<DB>; // For backward compatibility
    saveDB(db: DB): Promise<void>; // For backward compatibility
}
