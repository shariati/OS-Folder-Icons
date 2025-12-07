import { getBlogPosts } from '@/lib/db';
import { BlogPostCard } from './BlogPostCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FeaturedBlogsProps {
  count?: number;
  title?: string;
}

export async function FeaturedBlogs({ count = 3, title = 'Latest from Our Blog' }: FeaturedBlogsProps) {
  const allPosts = await getBlogPosts();
  
  // Filter published posts and sort by publishedAt
  const publishedPosts = allPosts
    .filter(post => post.published && post.publishedAt)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Insights, tutorials, and updates from our team
            </p>
          </div>
          <Link 
            href="/blog" 
            className="hidden md:flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors group"
          >
            View All Posts 
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedPosts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-12 text-center md:hidden">
          <Link 
            href="/blog"
            className="inline-flex items-center px-8 py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
          >
            View All Posts
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
