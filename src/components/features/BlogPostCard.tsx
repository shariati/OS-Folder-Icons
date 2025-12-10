'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/types';
import { Calendar, Clock } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface BlogPostCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
}

export function BlogPostCard({ post, variant = 'default' }: BlogPostCardProps) {
  const formattedDate = post.publishedAt ? formatDate(post.publishedAt, 'LONG') : 'Draft';

  const readingTime = post.readingTime || 5;

  if (variant === 'compact') {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="flex gap-4 rounded-xl bg-white p-4 transition-all duration-300 hover:shadow-lg dark:bg-gray-800">
          {post.coverImage && (
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
              {post.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{formattedDate}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block h-[400px] overflow-hidden rounded-3xl shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600" />
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-500 group-hover:from-black/80" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8">
        {/* Date Badge */}
        <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
          <Calendar size={16} />
          {formattedDate}
        </div>

        {/* Title and Excerpt */}
        <div className="space-y-3">
          <h3 className="text-3xl font-bold leading-tight text-white transition-colors duration-300 group-hover:text-blue-300">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="line-clamp-2 text-lg leading-relaxed text-white/90">{post.excerpt}</p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{readingTime} min read</span>
            </div>
          </div>

          {/* Read More Indicator */}
          <div className="flex items-center gap-2 font-bold text-white transition-all duration-300 group-hover:gap-4">
            <span>Read More</span>
            <svg
              className="h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Decorative Corner Element */}
      <div className="absolute left-0 top-0 h-32 w-32 rounded-br-full bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Link>
  );
}
