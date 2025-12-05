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
    stripeCustomerId?: string;
    subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | null;
    currentPeriodEnd?: string; // ISO date
    planId?: string; // To track monthly vs annual vs lifetime
}

export interface FavouriteList {
    id: string;
    userId: string;
    name: string;
    folderIds: string[]; // IDs of generated folders
    createdAt: string;
}
