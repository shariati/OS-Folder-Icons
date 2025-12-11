'use client';

import { forwardRef, useEffect, useRef, useImperativeHandle, memo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import * as HeroIcons from '@heroicons/react/24/solid';
import * as Unicons from '@iconscout/react-unicons';
import * as GrommetIcons from 'grommet-icons';
import { clsx } from 'clsx';
import { toPng } from 'html-to-image';
import { generateICO, generateICNS } from '@/lib/utils/icon-generator';

export interface CanvasPreviewProps {
  folderImage?: string;
  iconName?: string | null;
  iconType: 'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons';
  iconColor: string;
  iconSize: 'sm' | 'md' | 'lg';
  offsetX?: number;
  offsetY?: number;
  format?: 'png' | 'ico' | 'icns';
  iconEffect?: 'raised' | 'sunken' | 'glass' | 'flat';
  iconTransparency?: number;
  folderHue?: number;
  enableCors?: boolean;
  // For download filename generation
  osName?: string;
  folderName?: string;
  // Enable download listener on this instance
  enableDownload?: boolean;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: Error) => void;
}

// Memoize the component to prevent re-renders when parent re-renders but props are same
export const CanvasPreview = memo(
  forwardRef<HTMLDivElement, CanvasPreviewProps>(
    (
      {
        folderImage,
        iconName,
        iconType,
        iconColor,
        iconSize,
        offsetX = 0,
        offsetY = 0,
        format = 'png',
        iconEffect = 'none',
        iconTransparency = 1,
        folderHue = 0,
        enableCors = true,
        osName = 'Custom',
        folderName = 'Icon',
        enableDownload = false,
        onDownloadStart,
        onDownloadComplete,
        onDownloadError,
      },
      ref
    ) => {
      const containerRef = useRef<HTMLDivElement>(null);

      // Expose the container ref via forwardRef
      useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

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

      // Effect to handle image loading:
      // If download is enabled, pre-fetch as Blob to bypass html-to-image caching issues.
      // If not, just use the URL directly for performance.
      useEffect(() => {
        if (!imageSrc) {
          setDisplaySrc(undefined);
          return;
        }

        if (!enableDownload) {
          setDisplaySrc(imageSrc);
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
            console.error('Failed to load image blob:', err);
            if (active) setDisplaySrc(imageSrc); // Fallback
          }
        };

        fetchBlob();

        return () => {
          active = false;
          // Data URLs don't need revocation
        };
      }, [imageSrc, enableDownload]);

      // Keep track of latest props with a ref to access them in the event handler consistently
      const propsRef = useRef({
        osName,
        folderName,
        format,
        displaySrc, // Use the proper display source (Blob or URL)
        // Also store styling props since they affect the capture
        iconName,
        iconType,
        iconColor,
        iconSize,
        offsetX,
        offsetY,
        iconEffect,
        iconTransparency,
        folderHue,
      });

      useEffect(() => {
        propsRef.current = {
          osName,
          folderName,
          format,
          displaySrc,
          iconName,
          iconType,
          iconColor,
          iconSize,
          offsetX,
          offsetY,
          iconEffect,
          iconTransparency,
          folderHue,
        };
      }, [
        osName,
        folderName,
        format,
        displaySrc,
        iconName,
        iconType,
        iconColor,
        iconSize,
        offsetX,
        offsetY,
        iconEffect,
        iconTransparency,
        folderHue,
      ]);

      // Download handler - Defined ONCE (mostly)
      const handleDownload = async () => {
        // Check ref immediately
        if (!containerRef.current) {
          console.error('[CanvasPreview] Container ref is missing!');
          return;
        }

        onDownloadStart?.();

        try {
          // GET FRESH STATE FROM REF
          const current = propsRef.current;
          const fileName = `${current.osName} - ${current.folderName}`;
          const currentFormat = current.format || 'png';

          // Determine sizes based on format
          let sizes: number[] = [512];
          if (currentFormat === 'ico') {
            sizes = [16, 32, 48, 64, 256];
          } else if (currentFormat === 'icns') {
            sizes = [16, 32, 64, 128, 256, 512, 1024];
          }

          const images: { width: number; height: number; data: Blob }[] = [];

          for (const size of sizes) {
            // console.log(`[CanvasPreview] Capturing size ${size}...`); // Reduce spam
            const dataUrl = await toPng(containerRef.current, {
              canvasWidth: size,
              canvasHeight: size,
              pixelRatio: 1,
              cacheBust: false, // Disable cache bust to use the already loaded browser image
            });

            // Convert Base64 to Blob manually (CSP-safe)
            const byteString = atob(dataUrl.split(',')[1]);
            const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });

            images.push({ width: size, height: size, data: blob });
          }

          let finalBlob: Blob;
          let finalFilename = `${fileName}.${currentFormat}`;

          if (currentFormat === 'ico') {
            finalBlob = await generateICO(images);
          } else if (currentFormat === 'icns') {
            finalBlob = await generateICNS(images);
          } else {
            finalBlob = images[0].data;
          }

          console.log('[CanvasPreview] Download ready. Blob size:', finalBlob.size);

          // Trigger download
          const url = URL.createObjectURL(finalBlob);
          const link = document.createElement('a');
          link.download = finalFilename;
          link.href = url;
          link.click();

          setTimeout(() => URL.revokeObjectURL(url), 60000);

          onDownloadComplete?.();
        } catch (err) {
          console.error('[CanvasPreview] Failed to generate icon:', err);
          onDownloadError?.(err as Error);
        }
      };

      // Listen for the custom download event
      // Only re-bind if enableDownload changes, avoiding thrashing listeners
      useEffect(() => {
        if (!enableDownload) return;

        const handler = () => handleDownload();
        window.addEventListener('trigger-download', handler);
        console.log('[CanvasPreview] Event listener added');

        return () => {
          window.removeEventListener('trigger-download', handler);
          console.log('[CanvasPreview] Event listener removed');
        };
      }, [enableDownload]); // Removed other dependencies to keep listener stable

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

      const sizeClass = {
        sm: 'w-1/3 h-1/3',
        md: 'w-1/2 h-1/2',
        lg: 'w-2/3 h-2/3',
      }[iconSize];

      const fontSize = {
        sm: '170px',
        md: '256px',
        lg: '340px',
      }[iconSize];

      const getEffectStyle = () => {
        const baseStyle = {
          opacity: iconTransparency,
          mixBlendMode: 'normal' as const,
          filter: 'none',
        };

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
            filter:
              'drop-shadow(0 4px 6px rgba(0,0,0,0.1)) drop-shadow(0 2px 4px rgba(0,0,0,0.06))',
            mixBlendMode: 'overlay' as const,
            opacity: iconTransparency * 0.7,
          };
        }

        return baseStyle;
      };

      const effectStyle = getEffectStyle();

      return (
        <div
          ref={containerRef}
          className="relative flex h-[512px] w-[512px] items-center justify-center bg-transparent"
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
                filter:
                  folderHue !== 0 ? `hue-rotate(${folderHue}deg) sepia(0.5) saturate(2)` : 'none',
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
  )
);

CanvasPreview.displayName = 'CanvasPreview';
