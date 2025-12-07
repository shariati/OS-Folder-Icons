'use server';

import { getBlogPosts, updateBlogPost } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function incrementViewCountAction(slug: string) {
    try {
        const posts = await getBlogPosts();
        const post = posts.find((p) => p.slug === slug);

        if (post) {
            const currentViews = post.views || 0;
            await updateBlogPost(post.id, { views: currentViews + 1 });
            // We don't revalidatePath here to avoid purging cache on every view
            // The view count updates will reflect eventually or on next rebuild/revalidate
        }
    } catch (error) {
        console.error('Error incrementing view count:', error);
    }
}
