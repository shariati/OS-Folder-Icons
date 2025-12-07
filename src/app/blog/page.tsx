import { getBlogPosts } from '@/lib/db';
import { BlogPostCard } from '@/components/features/BlogPostCard';
import { Footer } from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | HDPick - Custom OS Folder Icons',
  description: 'Read our latest articles, tutorials, and insights about custom folder icons, design tips, and productivity hacks.',
  openGraph: {
    title: 'Blog | HDPick',
    description: 'Read our latest articles, tutorials, and insights about custom folder icons, design tips, and productivity hacks.',
    type: 'website',
  },
};

export default async function BlogPage() {
  const allPosts = await getBlogPosts();
  
  // Filter and sort published posts (exclude future dates)
  const now = new Date().getTime();
  const publishedPosts = allPosts
    .filter(post => post.published && post.publishedAt && new Date(post.publishedAt).getTime() <= now)
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt!).getTime();
      const dateB = new Date(b.publishedAt!).getTime();
      return dateB - dateA; // Most recent first
    });

  return (
    <>
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-gray-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Insights, tutorials, and updates about custom folder icons, design, and productivity
          </p>
        </div>

        {/* Blog Posts Grid */}
        {publishedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
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
