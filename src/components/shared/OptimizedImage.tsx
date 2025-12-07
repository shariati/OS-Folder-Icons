'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

/**
 * OptimizedImage Component
 * 
 * A wrapper around Next.js Image component that provides:
 * - Responsive image sizes for mobile/tablet/desktop
 * - Retina display support (2x, 3x)
 * - Blur placeholder for better perceived performance
 * - Proper sizing to avoid layout shift
 */

interface OptimizedImageProps extends Omit<ImageProps, 'sizes'> {
  /**
   * Predefined size presets for common use cases:
   * - thumbnail: Small images (icons, avatars)
   * - card: Card images in grids
   * - hero: Full-width hero images
   * - full: Large content images
   */
  sizePreset?: 'thumbnail' | 'card' | 'hero' | 'full';
  /**
   * Custom sizes string (overrides preset)
   * Example: "(max-width: 768px) 100vw, 50vw"
   */
  sizes?: string;
  /**
   * Enable blur placeholder for perceived performance
   * Default: true for remote images, false for local
   */
  enableBlur?: boolean;
  /**
   * Image quality (1-100)
   * Default: 85 (good balance of quality vs size)
   */
  quality?: number;
}

/**
 * Size presets optimized for different viewports and retina displays
 * These values tell the browser which image size to request based on viewport
 */
const SIZE_PRESETS = {
  // Small images: full width on mobile, fixed size on larger screens
  thumbnail: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 128px',
  // Card images: responsive grid layout
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  // Hero images: always full viewport width
  hero: '100vw',
  // Full content images: max out at reasonable size
  full: '(max-width: 640px) 100vw, (max-width: 1200px) 80vw, 1200px',
} as const;

/**
 * Minimal blur placeholder data URL (tiny gray square)
 * This displays immediately while the full image loads
 */
const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';

export function OptimizedImage({
  sizePreset = 'card',
  sizes,
  enableBlur = true,
  quality = 85,
  alt,
  className = '',
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Use custom sizes if provided, otherwise use preset
  const finalSizes = sizes || SIZE_PRESETS[sizePreset];
  
  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    onLoad?.(event);
  };
  
  return (
    <Image
      {...props}
      alt={alt}
      sizes={finalSizes}
      quality={quality}
      placeholder={enableBlur ? 'blur' : 'empty'}
      blurDataURL={enableBlur ? BLUR_DATA_URL : undefined}
      onLoad={handleLoad}
      className={`${className} ${isLoading ? 'animate-pulse bg-gray-200 dark:bg-gray-700' : ''} transition-opacity duration-300`}
    />
  );
}

/**
 * Hook for generating responsive srcSet manually if needed
 * Useful for non-Next.js image contexts
 */
export function useResponsiveSizes(baseWidth: number) {
  return {
    // Mobile: 1x and 2x
    mobile: `${baseWidth}w, ${baseWidth * 2}w`,
    // Tablet: 1x and 2x  
    tablet: `${Math.round(baseWidth * 1.5)}w, ${baseWidth * 3}w`,
    // Desktop: 1x and 2x
    desktop: `${baseWidth * 2}w, ${baseWidth * 4}w`,
  };
}
