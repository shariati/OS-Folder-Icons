import React, { ReactNode } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { Folder as FolderType } from '@/types/folder';

export interface FolderProps {
  /**
   * The folder data object. If provided, specific props like folderImage, folderHue, etc.
   * can still assume priority if passed explicitly, or fall back to this object.
   */
  folder?: FolderType;

  /**
   * Image URL for the folder background.
   */
  folderImage?: string;

  /**
   * Size of the folder in pixels (width/height). Default: 128.
   */
  folderSize?: number;

  /**
   * Icon to display on top of the folder.
   * Can be a React component, SVG string, or image URL.
   */
  icon?: ReactNode | string;

  /**
   * Type of the icon provided. Default: 'component'.
   */
  iconType?: 'component' | 'image';

  /**
   * Size of the icon. Default: 'medium'.
   */
  iconSize?: 'sm' | 'md' | 'lg';

  /**
   * Visual style effect for the icon.
   * @default 'none'
   */
  iconStyle?: 'raised' | 'sunken' | 'glass' | 'flat' | 'none';

  /**
   * Font/Icon Transparency (0-1).
   * @default 1
   */
  iconTransparency?: number;

  /**
   * Enables a simple hover animation (e.g. scale up).
   */
  hoverAnimation?: boolean;

  /**
   * Hue rotation in degrees for the folder image. Default: 0.
   */
  folderHue?: number;

  /**
   * X offset for the ICON, in pixels. Default: 0.
   */
  offsetX?: number;

  /**
   * Y offset for the ICON, in pixels. Default: 0.
   */
  offsetY?: number;

  /**
   * Optional text label to display beneath the folder.
   */
  label?: string;

  /**
   * If true, suppresses the folder label.
   */
  hideLabel?: boolean;

  /**
   * Image loading strategy. Default: 'lazy'.
   */
  loading?: 'lazy' | 'eager';

  /**
   * OS Name for accessibility/alt text purposes.
   */
  osName?: string;

  className?: string;
}

export const Folder = ({
  folder,
  folderImage,
  folderSize = 128,
  icon,
  iconType = 'component',
  iconSize = 'md',
  iconStyle = 'none',
  iconTransparency = 1,
  hoverAnimation = false,
  folderHue = 0,
  offsetX = 0,
  offsetY = 0,
  label,
  hideLabel = false,
  loading = 'lazy',
  osName,
  className,
}: FolderProps) => {
  // Resolve values: explicit props take precedence over 'folder' object
  const finalImage = folderImage || folder?.imageUrl;
  const finalHue = folderHue !== 0 ? folderHue : folder?.hue || 0;
  const finalOffsetX = offsetX !== 0 ? offsetX : folder?.offsetX || 0;
  const finalOffsetY = offsetY !== 0 ? offsetY : folder?.offsetY || 0;
  const finalOsName = osName || folder?.osName || 'System';
  const finalName = label || folder?.name || 'Folder';

  // Helper to render the icon content
  const renderIcon = () => {
    if (!icon) return null;

    const sizeClasses = {
      sm: 'w-1/3 h-1/3',
      md: 'w-1/2 h-1/2',
      lg: 'w-2/3 h-2/3',
    }[iconSize];

    // Helper calculate styles
    const getEffectStyle = () => {
      const baseStyle = {
        opacity: iconTransparency,
        mixBlendMode: 'normal' as const,
        filter: 'none',
      };

      if (iconStyle === 'sunken') {
        return {
          ...baseStyle,
          filter:
            'drop-shadow(0px 2px 0px rgba(255, 255, 255, 0.3)) drop-shadow(0px -1px 0px rgba(0, 0, 0, 0.2))',
          mixBlendMode: 'overlay' as const,
          opacity: iconTransparency * 0.9,
        };
      }

      if (iconStyle === 'raised') {
        return {
          ...baseStyle,
          filter:
            'drop-shadow(-1px -1px 0px rgba(255, 255, 255, 0.5)) drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.3))',
        };
      }

      if (iconStyle === 'glass') {
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

    if (iconType === 'image' && typeof icon === 'string') {
      return (
        <img
          src={icon}
          alt="Folder Icon"
          className={clsx('pointer-events-none select-none object-contain', sizeClasses)}
          style={effectStyle}
        />
      );
    }

    // Calculate font size for font-based icons (like FontAwesome)
    // Ratios based on 512px canvas: small=170(~33%), medium=256(50%), large=340(~66%)
    const fontSizeRatio = {
      sm: 0.33,
      md: 0.5,
      lg: 0.66,
    }[iconSize];

    const derivedFontSize = Math.floor(folderSize * fontSizeRatio);

    // For font icons or components, we wrap them ensuring they center and scale if possible
    return (
      <div
        className={clsx('pointer-events-none flex items-center justify-center', sizeClasses)}
        style={{ fontSize: `${derivedFontSize}px`, ...effectStyle }}
      >
        {icon}
      </div>
    );
  };

  return (
    <div
      className={clsx(
        'group relative flex select-none flex-col items-center justify-center gap-2',
        hoverAnimation && 'transition-transform duration-200 hover:scale-105 active:scale-95',
        className
      )}
      style={{ width: folderSize, height: 'auto' }}
    >
      <div
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: folderSize, height: folderSize }}
      >
        {/* Base Folder Image */}
        {finalImage ? (
          <Image
            src={finalImage}
            alt={`${finalOsName} Folder`}
            fill
            className="object-contain"
            priority={loading === 'eager'}
            loading={loading === 'eager' ? undefined : 'lazy'}
            sizes={`${folderSize}px`}
            draggable={false}
            style={{
              filter: finalHue !== 0 ? `hue-rotate(${finalHue}deg)` : 'none',
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-700">
            <span className="text-xs text-gray-400">No Image</span>
          </div>
        )}

        {/* Icon Overlay */}
        {icon && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{
              transform: `translate(${finalOffsetX * (folderSize / 512)}px, ${
                finalOffsetY * (folderSize / 512)
              }px)`,
            }}
          >
            {renderIcon()}
          </div>
        )}
      </div>

      {/* Label */}
      {!hideLabel && finalName && (
        <span className="pointer-events-none max-w-full truncate px-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
          {finalName}
        </span>
      )}
    </div>
  );
};

export default Folder;
