'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Folder, FolderProps } from '@/components/ui/Folder';
import { Loading } from '@/components/ui/Loading';

export interface DesktopProps {
  /**
   * background image URL
   */
  wallpaperUrl: string;
  /**
   * Props to pass to the Folder component.
   */
  folderProps: FolderProps;
  /**
   * Helper text for the loading state.
   */
  loadingText?: string;
  /**
   * Display mode: single centered folder or multiple sizes.
   */
  mode: 'single' | 'multiple';
  /**
   * Viewport variant: responsive behavior.
   */
  variant: 'mobile' | 'desktop';
  /**
   * Array of sizes to display in 'multiple' mode.
   */
  folderSizes?: number[];
  /**
   * Size for the single folder mode. Default: 256.
   */
  singleSize?: number;
  /**
   * Alignment of the folder in 'single' mode.
   * @default 'center center'
   */
  folderalign?:
    | 'top left'
    | 'top center'
    | 'top right'
    | 'center left'
    | 'center center'
    | 'center right'
    | 'bottom left'
    | 'bottom center'
    | 'bottom right';
  /**
   * Tailwind border radius class.
   * @default 'rounded-2xl'
   */
  radius?: string;
  className?: string;
}

export function Desktop({
  wallpaperUrl,
  folderProps,
  loadingText = 'Loading Desktop...',
  mode,
  variant,
  folderSizes = [16, 24, 32, 48, 96, 128, 256, 512],
  singleSize = 256,
  folderalign = 'center center',
  radius = 'rounded-2xl',
  className,
}: DesktopProps) {
  const [isWallpaperLoaded, setIsWallpaperLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isFolderLoaded, setIsFolderLoaded] = useState(false);

  // Determine if we need to show the loader
  // We wait for wallpaper to load.
  const folderImageUrl = folderProps.folderImage || folderProps.folder?.imageUrl;
  const hasFolderImage = !!folderImageUrl;

  useEffect(() => {
    // Wallpaper loader
    if (wallpaperUrl) {
      setLoadError(false);
      const img = new window.Image();
      img.src = wallpaperUrl;
      img.onload = () => setIsWallpaperLoaded(true);
      img.onerror = () => {
        setIsWallpaperLoaded(true);
        setLoadError(true);
      };
    } else {
      setIsWallpaperLoaded(true);
    }
  }, [wallpaperUrl]);

  useEffect(() => {
    // Folder image loader
    if (hasFolderImage) {
      const img = new window.Image();
      img.src = folderImageUrl;
      img.onload = () => setIsFolderLoaded(true);
      img.onerror = () => setIsFolderLoaded(true);
    } else {
      setIsFolderLoaded(true);
    }
  }, [folderImageUrl, hasFolderImage]);

  const isLoading = !isWallpaperLoaded || !isFolderLoaded;
  const showGradient = loadError || !wallpaperUrl;

  // Alignment classes mapping
  const alignmentClasses =
    {
      'top left': 'items-start justify-start',
      'top center': 'items-start justify-center',
      'top right': 'items-start justify-end',
      'center left': 'items-center justify-start',
      'center center': 'items-center justify-center',
      'center right': 'items-center justify-end',
      'bottom left': 'items-end justify-start',
      'bottom center': 'items-end justify-center',
      'bottom right': 'items-end justify-end',
    }[folderalign] || 'items-center justify-center';

  // Apply alignment only in single mode, otherwise force center/start logic for multiple
  const containerAlignment = mode === 'single' ? alignmentClasses : '';

  return (
    <div
      className={clsx(
        'relative flex flex-col overflow-hidden bg-gray-900',
        radius,
        variant === 'mobile' ? 'h-full w-full' : 'h-full w-full',
        className
      )}
    >
      {/* Loader Overlay */}
      {isLoading && <Loading text={loadingText} className="z-50" variant="child" />}

      {/* Wallpaper Layer */}
      <div
        className={clsx(
          'absolute inset-0 z-0 transition-opacity duration-500',
          showGradient
            ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400'
            : 'bg-cover bg-center'
        )}
        style={{
          backgroundImage: showGradient ? undefined : `url(${wallpaperUrl})`,
          opacity: isLoading ? 0 : 1,
        }}
      />

      {/* Content Layer */}
      <div
        className={clsx(
          'relative z-10 flex w-full flex-grow p-8 transition-opacity duration-500',
          containerAlignment,
          isLoading ? 'opacity-0' : 'opacity-100',
          mode === 'multiple' && 'content-start items-start justify-center overflow-y-auto'
        )}
      >
        {mode === 'single' ? (
          <div className="flex items-center justify-center">
            <Folder {...folderProps} folderSize={singleSize} loading="eager" />
          </div>
        ) : (
          <div
            className={clsx(
              'w-full gap-8',
              variant === 'mobile'
                ? 'grid grid-cols-2 place-items-center'
                : 'flex flex-wrap items-end justify-center'
            )}
          >
            {folderSizes.map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <Folder {...folderProps} folderSize={size} loading="lazy" />
                <span className="text-xs font-medium text-white shadow-black drop-shadow-md">
                  {size}px
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
