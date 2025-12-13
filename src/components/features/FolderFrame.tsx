'use client';

import { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import * as HeroIcons from '@heroicons/react/24/solid';
import * as Unicons from '@iconscout/react-unicons';
import * as GrommetIcons from 'grommet-icons';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface FolderFrameProps {
  folderImage?: string;
  iconName?: string | null;
  iconType?: 'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons';
  iconColor?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  offsetX?: number;
  offsetY?: number;
  iconEffect?: 'none' | 'raised' | 'sunken' | 'glass' | 'flat';
  iconTransparency?: number;
  folderHue?: number;
  enableCors?: boolean;
  className?: string;
}

export function FolderFrame({
  folderImage,
  iconName,
  iconType = 'lucide',
  iconColor = '#000000',
  iconSize = 'md',
  offsetX = 0,
  offsetY = 0,
  iconEffect = 'sunken',
  iconTransparency = 0.5,
  folderHue = 0,
  enableCors = true,
  className,
}: FolderFrameProps) {
  // Build the image URL with CORS proxy, ensuring Absolute URL for html-to-image stability
  const getImageSrc = () => {
    if (!folderImage) return undefined;

    if (enableCors) {
      // Use window.location.origin to make it absolute if we are on client side
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return `${origin}/api/proxy?url=${encodeURIComponent(folderImage)}`;
    }
    return folderImage;
  };

  const imageSrc = getImageSrc();
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(undefined);

  // Effect to handle image loading and preventing CSP/CORS issues by converting to blob
  useEffect(() => {
    if (!imageSrc) {
      setDisplaySrc(undefined);
      return;
    }

    let active = true;
    const fetchBlob = async () => {
      try {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        if (!active) return;

        // Convert to Base64 Data URL to avoid CSP 'connect-src' blob: issues
        const reader = new FileReader();
        reader.onloadend = () => {
          if (active && reader.result) {
            setDisplaySrc(reader.result as string);
          }
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('[FolderFrame] Failed to load image blob:', err);
        if (active) setDisplaySrc(imageSrc); // Fallback
      }
    };

    fetchBlob();

    return () => {
      active = false;
    };
  }, [imageSrc]);

  // Icon Resolution Logic
  const getIconComponent = () => {
    if (!iconName) return null;

    if (iconType === 'lucide') {
      return (LucideIcons as any)[iconName];
    }
    if (iconType === 'heroicons') {
      return (HeroIcons as any)[iconName];
    }
    if (iconType === 'unicons') {
      return (Unicons as any)[iconName];
    }
    if (iconType === 'grommet-icons') {
      return (GrommetIcons as any)[iconName];
    }
    return null;
  };

  const IconComponent = getIconComponent();

  // Style Logic
  const getSizeClass = () => {
    if (!iconSize) return '';
    const map = {
      sm: 'w-1/3 h-1/3',
      md: 'w-1/2 h-1/2',
      lg: 'w-2/3 h-2/3',
    };
    return (map as any)[iconSize] || '';
  };
  const sizeClass = getSizeClass();

  const getFontSize = () => {
    if (!iconSize) return '0px';
    const map = {
      sm: '170px',
      md: '256px',
      lg: '340px',
    };
    return (map as any)[iconSize] || '0px';
  };
  const fontSize = getFontSize();

  const getEffectStyle = () => {
    const baseStyle = {
      opacity: iconTransparency,
      mixBlendMode: 'normal' as const,
      filter: 'none',
    };

    if (!iconEffect) return baseStyle;

    if (iconEffect === 'sunken') {
      return {
        ...baseStyle,
        filter:
          'drop-shadow(0px 2px 0px rgba(255, 255, 255, 0.3)) drop-shadow(0px -1px 0px rgba(0, 0, 0, 0.2))',
        mixBlendMode: 'overlay' as const,
        opacity: iconTransparency * 0.9,
      };
    }

    if (iconEffect === 'raised') {
      return {
        ...baseStyle,
        filter:
          'drop-shadow(-1px -1px 0px rgba(255, 255, 255, 0.5)) drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.3))',
      };
    }

    if (iconEffect === 'glass') {
      return {
        ...baseStyle,
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1)) drop-shadow(0 2px 4px rgba(0,0,0,0.06))',
        mixBlendMode: 'overlay' as const,
        opacity: iconTransparency * 0.7,
      };
    }

    return baseStyle;
  };
  const effectStyle = getEffectStyle();

  return (
    <div
      className={twMerge(
        'relative flex items-center justify-center bg-transparent',
        className || 'h-[512px] w-[512px]'
      )}
    >
      {/* Folder Base */}
      {displaySrc && (
        <img
          key={displaySrc}
          src={displaySrc}
          alt="Folder"
          className="absolute inset-0 h-full w-full object-contain"
          crossOrigin="anonymous"
          style={{
            filter: folderHue !== 0 ? `hue-rotate(${folderHue}deg) sepia(0.5) saturate(2)` : 'none',
          }}
        />
      )}

      {/* Overlay Icon (React Components: Lucide, Heroicons, Unicons, Grommet) */}
      {IconComponent && (
        <div
          className={clsx('absolute z-10 flex items-center justify-center', sizeClass)}
          style={{
            color: iconColor,
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            ...effectStyle,
          }}
        >
          {iconType === 'grommet-icons' ? (
            <IconComponent size="100%" className="h-full w-full" color={iconColor} />
          ) : (
            <IconComponent size={400} className="h-full w-full" color={iconColor} />
          )}
        </div>
      )}

      {/* Font Icon Support (FontAwesome) */}
      {iconType === 'fontawesome' && iconName && (
        <div
          className={clsx('absolute z-10 flex items-center justify-center', sizeClass)}
          style={{
            color: iconColor,
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            fontSize: fontSize,
            ...effectStyle,
          }}
        >
          <i className={clsx(iconName)} style={{ fontSize: 'inherit' }}></i>
        </div>
      )}
    </div>
  );
}
