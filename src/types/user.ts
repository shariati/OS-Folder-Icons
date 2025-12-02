export type UserRole = 'admin' | 'free' | 'paid' | 'lifetime';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    createdAt: string;
    subscriptionId?: string; // Stripe or other subscription ID
    lifetimeAccess?: boolean;
    favouriteLists?: string[]; // IDs of favourite lists
    generatedFoldersCount?: number;
}

export interface FavouriteList {
    id: string;
    userId: string;
    name: string;
    folderIds: string[]; // IDs of generated folders
    createdAt: string;
}
