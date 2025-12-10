'use client';

import { Image as ImageIcon } from 'lucide-react';

interface SocialPreviewProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export function SocialPreview({
  title,
  description,
  image,
  url = 'example.com',
}: SocialPreviewProps) {
  return (
    <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark rounded-sm border bg-white">
      <div className="border-stroke px-6.5 dark:border-strokedark border-b py-4">
        <h3 className="font-medium text-black dark:text-white">Social Media Preview</h3>
      </div>
      <div className="p-6.5">
        <div className="mx-auto max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Image Preview */}
          <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700">
            {image ? (
              <img src={image} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon size={32} />
                  <span className="text-xs">No Social Image</span>
                </div>
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="bg-gray-50 p-4 dark:bg-gray-900">
            <p className="mb-1 text-xs uppercase text-gray-500">
              {url.replace(/^https?:\/\//, '')}
            </p>
            <h4 className="mb-2 line-clamp-2 text-base font-bold text-gray-900 dark:text-gray-100">
              {title || 'Page Title'}
            </h4>
            <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
              {description || 'Page description will appear here...'}
            </p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-500">
          Preview of how your content might appear on Facebook, Twitter, and LinkedIn.
        </p>
      </div>
    </div>
  );
}
