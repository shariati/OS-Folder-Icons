'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/types';
import { Calendar, Clock } from 'lucide-react';

interface BlogPostCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
}

export function BlogPostCard({ post, variant = 'default' }: BlogPostCardProps) {
  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : 'Draft';

  const readingTime = post.readingTime || 5;

  if (variant === 'compact') {
    return (
      <Link 
        href={`/blog/${post.slug}`}
        className="group block"
      >
        <div className="flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300">
          {post.coverImage && (
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <Image 
                src={post.coverImage} 
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formattedDate}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      href={`/blog/${post.slug}`}
      className="group block relative h-[400px] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {post.coverImage ? (
          <Image 
            src={post.coverImage} 
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/80 transition-all duration-500" />

      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        {/* Date Badge */}
        <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium">
          <Calendar size={16} />
          {formattedDate}
        </div>

        {/* Title and Excerpt */}
        <div className="space-y-3">
          <h3 className="text-3xl font-bold text-white leading-tight group-hover:text-blue-300 transition-colors duration-300">
            {post.title}
          </h3>
          
          {post.excerpt && (
            <p className="text-white/90 text-lg line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{readingTime} min read</span>
            </div>
          </div>

          {/* Read More Indicator */}
          <div className="flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all duration-300">
            <span>Read More</span>
            <svg 
              className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Decorative Corner Element */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Link>
  );
}
