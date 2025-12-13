import { Metadata } from 'next';

import { BlogPostCard } from '@/components/features/BlogPostCard';
import { Footer } from '@/components/layout/Footer';
import { getBlogPosts } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Blog | HDPick - Custom OS Folder Icons',
  description:
    'Read our latest articles, tutorials, and insights about custom folder icons, design tips, and productivity hacks.',
  openGraph: {
    title: 'Blog | HDPick',
    description:
      'Read our latest articles, tutorials, and insights about custom folder icons, design tips, and productivity hacks.',
    type: 'website',
  },
};

export default async function BlogPage() {
  const allPosts = await getBlogPosts();

  // Filter and sort published posts (exclude future dates)
  const now = new Date().getTime();
  const publishedPosts = allPosts
    .filter(
      (post) => post.published && post.publishedAt && new Date(post.publishedAt).getTime() <= now
    )
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt!).getTime();
      const dateB = new Date(b.publishedAt!).getTime();
      return dateB - dateA; // Most recent first
    });

  return (
    <>
      <div className="min-h-screen bg-[#e0e5ec] pb-16 pt-24 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
              Our Blog
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-400">
              Insights, tutorials, and updates about custom folder icons, design, and productivity
            </p>
          </div>

          {/* Blog Posts Grid */}
          {publishedPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {publishedPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-xl text-gray-500 dark:text-gray-400">
                No blog posts yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
