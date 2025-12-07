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
import { sanitizeHtml } from '@/lib/sanitize';

export async function saveSettingsAction(settings: Settings) {
    await dbSaveSettings(settings);
    revalidatePath('/admin');
}

export async function saveBlogPostAction(post: BlogPost) {
    // Check for duplicate slug
    const allPosts = await (await import('@/lib/db')).getBlogPosts();
    const duplicate = allPosts.find(p => p.slug === post.slug && p.id !== post.id);
    if (duplicate) {
        throw new Error(`Slug "${post.slug}" is already in use by another post`);
    }

    // Sanitize HTML content to prevent XSS attacks
    const sanitizedPost = {
        ...post,
        content: sanitizeHtml(post.content),
        excerpt: post.excerpt ? sanitizeHtml(post.excerpt) : undefined,
    };

    await dbSaveBlogPost(sanitizedPost);
    revalidatePath('/admin');
    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);
}

export async function deleteBlogPostAction(id: string) {
    await dbDeleteBlogPost(id);
    revalidatePath('/admin');
}

export async function savePageAction(page: Page) {
    // Sanitize HTML content to prevent XSS attacks
    const sanitizedPage = {
        ...page,
        content: sanitizeHtml(page.content),
    };

    await dbSavePage(sanitizedPage);
    revalidatePath('/admin');
    revalidatePath(`/${page.slug}`);
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
