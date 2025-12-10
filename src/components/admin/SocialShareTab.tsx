'use client';

import { SocialMetadata } from '@/lib/types';
import { ImageUploader } from './ImageUploader';
import { Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

interface SocialShareTabProps {
  social?: SocialMetadata;
  onChange: (social: SocialMetadata) => void;
  title?: string;
  description?: string;
  coverImage?: string;
  slug?: string;
  type?: 'page' | 'blog';
}

export function SocialShareTab({
  social = {},
  onChange,
  title,
  description,
  coverImage,
  slug,
  type = 'page',
}: SocialShareTabProps) {
  // Use fallbacks for preview
  const ogTitle = social.ogTitle || title || 'Page Title';
  const ogDescription =
    social.ogDescription || description || 'Page description will appear here...';
  const ogImage = social.ogImage || coverImage;
  const displayUrl = slug
    ? `https://yoursite.com/${type === 'blog' ? 'blog/' : ''}${slug}`
    : 'https://yoursite.com/page-slug';

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-8 py-12">
      {/* Open Graph Settings */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
          <Share2 className="text-blue-500" />
          Open Graph Settings
        </h3>

        <div className="space-y-6">
          {/* OG Title */}
          <div>
            <div className="mb-1 flex justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                OG Title
              </label>
              <span
                className={`text-xs ${(social.ogTitle?.length || 0) > 60 ? 'text-red-500' : 'text-gray-400'}`}
              >
                {social.ogTitle?.length || 0}/60
              </span>
            </div>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              placeholder={title || 'Leave empty to use page title'}
              value={social.ogTitle || ''}
              onChange={(e) => onChange({ ...social, ogTitle: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-400">Falls back to page title if empty</p>
          </div>

          {/* OG Description */}
          <div>
            <div className="mb-1 flex justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                OG Description
              </label>
              <span
                className={`text-xs ${(social.ogDescription?.length || 0) > 200 ? 'text-red-500' : 'text-gray-400'}`}
              >
                {social.ogDescription?.length || 0}/200
              </span>
            </div>
            <textarea
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              placeholder={description || 'Leave empty to use SEO description'}
              value={social.ogDescription || ''}
              onChange={(e) => onChange({ ...social, ogDescription: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-400">Falls back to SEO description if empty</p>
          </div>

          {/* OG Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              OG Image
            </label>
            <ImageUploader
              value={social.ogImage}
              onChange={(url) => onChange({ ...social, ogImage: url })}
              folder="social"
              aspectRatio="video"
            />
            <p className="mt-2 text-xs text-gray-400">
              Recommended: 1200x630px. Falls back to cover image if empty.
            </p>
          </div>

          {/* OG Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              OG Type
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              value={social.ogType || (type === 'blog' ? 'article' : 'website')}
              onChange={(e) => onChange({ ...social, ogType: e.target.value as any })}
            >
              <option value="website">Website</option>
              <option value="article">Article</option>
              <option value="blog">Blog</option>
            </select>
          </div>
        </div>
      </div>

      {/* Twitter Card Settings */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
          <Twitter className="text-sky-500" />
          Twitter Card Settings
        </h3>

        <div className="space-y-6">
          {/* Twitter Card Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Card Type
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              value={social.twitterCard || 'summary_large_image'}
              onChange={(e) => onChange({ ...social, twitterCard: e.target.value as any })}
            >
              <option value="summary">Summary</option>
              <option value="summary_large_image">Summary with Large Image</option>
              <option value="player">Player</option>
            </select>
          </div>

          {/* Twitter Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Twitter Title
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              placeholder="Leave empty to use OG title"
              value={social.twitterTitle || ''}
              onChange={(e) => onChange({ ...social, twitterTitle: e.target.value })}
            />
          </div>

          {/* Twitter Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Twitter Description
            </label>
            <textarea
              rows={2}
              className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              placeholder="Leave empty to use OG description"
              value={social.twitterDescription || ''}
              onChange={(e) => onChange({ ...social, twitterDescription: e.target.value })}
            />
          </div>

          {/* Twitter Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Twitter Image
            </label>
            <ImageUploader
              value={social.twitterImage}
              onChange={(url) => onChange({ ...social, twitterImage: url })}
              folder="social"
              aspectRatio="video"
            />
            <p className="mt-2 text-xs text-gray-400">Leave empty to use OG image</p>
          </div>
        </div>
      </div>

      {/* Social Preview */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-6 text-lg font-bold">Social Preview</h3>

        <div className="space-y-6">
          {/* Facebook Preview */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Facebook size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Facebook / LinkedIn
              </span>
            </div>
            <div className="max-w-md overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              {ogImage && (
                <img src={ogImage} alt="OG Preview" className="aspect-video w-full object-cover" />
              )}
              <div className="p-3">
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">
                  {displayUrl.replace(/^https?:\/\//, '').split('/')[0]}
                </p>
                <h4 className="mt-1 line-clamp-2 text-sm font-bold text-gray-900 dark:text-white">
                  {ogTitle}
                </h4>
                <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                  {ogDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Twitter Preview */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Twitter size={18} className="text-sky-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Twitter / X
              </span>
            </div>
            <div className="max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              {(social.twitterImage || ogImage) && (
                <img
                  src={social.twitterImage || ogImage}
                  alt="Twitter Preview"
                  className="aspect-video w-full object-cover"
                />
              )}
              <div className="p-3">
                <h4 className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-white">
                  {social.twitterTitle || ogTitle}
                </h4>
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  {social.twitterDescription || ogDescription}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  🔗 {displayUrl.replace(/^https?:\/\//, '').split('/')[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
