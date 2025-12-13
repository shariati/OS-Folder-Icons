import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BlogPostCard } from '@/components/features/BlogPostCard';
import { ViewCounter } from '@/components/features/ViewCounter';
import { Footer } from '@/components/layout/Footer';
import { SOCIAL_SHARE_URLS } from '@/constants/links';
import { getBlogPosts } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { sanitizeHtmlWithLinks } from '@/lib/sanitize';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getBlogPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post || !post.published) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || 'Read this blog post on HDPick',
    keywords: post.seoKeywords,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || '',
      type: 'article',
      publishedTime: post.publishedAt,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || '',
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const posts = await getBlogPosts();
  const post = posts.find((p) => p.slug === slug);

  const now = new Date().getTime();
  if (
    !post ||
    !post.published ||
    (post.publishedAt && new Date(post.publishedAt).getTime() > now)
  ) {
    notFound();
  }

  // Get related posts (3 latest excluding current)
  const relatedPosts = posts
    .filter(
      (p) =>
        p.published && p.id !== post.id && p.publishedAt && new Date(p.publishedAt).getTime() <= now
    )
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt!).getTime();
      const dateB = new Date(b.publishedAt!).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  const formattedDate = post.publishedAt ? formatDate(post.publishedAt, 'LONG') : '';

  const readingTime = post.readingTime || 5;
  const sanitizedContent = sanitizeHtmlWithLinks(post.content);

  return (
    <>
      <div className="min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
        <ViewCounter slug={post.slug} />
        {/* Back Button */}
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <article className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <header className="mb-12">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl dark:text-white">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="mb-8 flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{readingTime} min read</span>
              </div>
            </div>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="relative mb-8 h-[400px] w-full overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          {/* Article Content */}
          <div
            className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-img:rounded-xl prose-img:shadow-lg prose-blockquote:border-l-blue-600 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Share Buttons */}
          <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 font-medium text-gray-600 dark:text-gray-400">
                <Share2 size={20} />
                Share this post:
              </span>
              <a
                href={`${SOCIAL_SHARE_URLS.TWITTER}?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
              >
                Twitter
              </a>
              <a
                href={`${SOCIAL_SHARE_URLS.FACEBOOK}?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-800"
              >
                Facebook
              </a>
              <a
                href={`${SOCIAL_SHARE_URLS.LINKEDIN}?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-blue-800 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-900"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 py-16 dark:bg-gray-900/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
                Related Posts
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <BlogPostCard key={relatedPost.id} post={relatedPost} variant="compact" />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
