'use server';

import {
    saveSettings as dbSaveSettings,
    saveBlogPost as dbSaveBlogPost,
    deleteBlogPost as dbDeleteBlogPost,
    savePage as dbSavePage,
    deletePage as dbDeletePage,
    updateUser as dbUpdateUser,
    deleteUser as dbDeleteUser
} from '@/lib/db';
import { Settings, BlogPost, Page, UserProfile } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function saveSettingsAction(settings: Settings) {
    await dbSaveSettings(settings);
    revalidatePath('/admin');
}

export async function saveBlogPostAction(post: BlogPost) {
    await dbSaveBlogPost(post);
    revalidatePath('/admin');
}

export async function deleteBlogPostAction(id: string) {
    await dbDeleteBlogPost(id);
    revalidatePath('/admin');
}

export async function savePageAction(page: Page) {
    await dbSavePage(page);
    revalidatePath('/admin');
}

export async function deletePageAction(id: string) {
    await dbDeletePage(id);
    revalidatePath('/admin');
}

export async function updateUserRoleAction(uid: string, role: 'admin' | 'free' | 'paid' | 'lifetime') {
    await dbUpdateUser(uid, { role });
    revalidatePath('/admin');
}

export async function deleteUserAction(uid: string) {
    await dbDeleteUser(uid);
    revalidatePath('/admin');
}
