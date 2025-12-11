'use client';

import React, { useEffect, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCachedVideo } from '@/hooks/useCachedVideo';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';

export interface LoadingProps {
  /**
   * Layout variant.
   * - 'child': Fills the parent container (absolute or relative)
   * - 'page': Fills the entire viewport (fixed)
   * @default 'child'
   */
  variant?: 'child' | 'page';
  /**
   * Optional text to display below the loader.
   */
  text?: string;
  /**
   * Source URL for the video loader.
   * If not provided, it will attempt to load the default 'Sandy Loading.webm' from Firebase.
   */
  videoSrc?: string;
  /**
   * Static image to show while video is loading or as fallback.
   * Recommended to provide this for better UX.
   */
  imageSrc?: string | StaticImageData;
  /**
   * Custom class names.
   */
  className?: string;
}

export function Loading({ variant = 'child', text, videoSrc, imageSrc, className }: LoadingProps) {
  const [fetchedVideoSrc, setFetchedVideoSrc] = useState<string | null>(null);

  // If no videoSrc is provided, try to fetch the default from Firebase
  useEffect(() => {
    if (videoSrc) return;

    if (storage) {
      getDownloadURL(ref(storage, 'public/Sandy Loading.webm'))
        .then((url) => setFetchedVideoSrc(url))
        .catch((err) => console.error('Failed to load default loading video:', err));
    }
  }, [videoSrc]);

  const finalVideoSrc = videoSrc || fetchedVideoSrc;
  const cachedSrc = useCachedVideo(finalVideoSrc || undefined);
  const isVideoReady = !!cachedSrc;

  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center gap-4 bg-gray-50/80 p-4 text-center backdrop-blur-sm dark:bg-gray-900/80',
        variant === 'page' && 'fixed inset-0 z-50 h-screen w-screen',
        variant === 'child' && 'rounded-inherit absolute inset-0 z-10 h-full w-full',
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Video Loader */}
        {isVideoReady ? (
          <video
            src={cachedSrc}
            autoPlay
            loop
            muted
            playsInline
            className="h-32 w-32 object-contain"
          />
        ) : (
          /* Fallback / Loading State */
          <div className="flex h-32 w-32 items-center justify-center">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt="Loading..."
                width={128}
                height={128}
                className="h-full w-full animate-pulse object-contain"
              />
            ) : (
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
            )}
          </div>
        )}
      </div>

      {/* Loading Text */}
      {text && (
        <span className="animate-pulse text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  );
}
