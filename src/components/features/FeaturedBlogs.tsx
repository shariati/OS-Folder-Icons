import { getBlogPosts } from '@/lib/db';
import { BlogPostCard } from './BlogPostCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FeaturedBlogsProps {
  count?: number;
  title?: string;
}

export async function FeaturedBlogs({
  count = 3,
  title = 'Latest from Our Blog',
}: FeaturedBlogsProps) {
  const allPosts = await getBlogPosts();

  // Filter published posts and sort by publishedAt
  const publishedPosts = allPosts
    .filter((post) => post.published && post.publishedAt)
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt!).getTime();
      const dateB = new Date(b.publishedAt!).getTime();
      return dateB - dateA; // Most recent first
    })
    .slice(0, count);

  if (publishedPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl dark:text-white">
              {title}
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Insights, tutorials, and updates from our team
            </p>
          </div>
          <Link
            href="/blog"
            className="group hidden items-center font-bold text-blue-600 transition-colors hover:text-blue-700 md:flex"
          >
            View All Posts
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {publishedPosts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-12 text-center md:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            View All Posts
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
