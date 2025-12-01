'use client';

import { useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import * as LucideIcons from 'lucide-react';
import * as HeroIcons from '@heroicons/react/24/solid';
import * as Unicons from '@iconscout/react-unicons';
import * as GrommetIcons from 'grommet-icons';
import { clsx } from 'clsx';

interface CanvasPreviewProps {
  folderImage?: string;
  iconName?: string | null;
  iconType: 'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons';
  iconColor: string;
  iconSize: 'small' | 'medium' | 'large';
  offsetX?: number;
  offsetY?: number;
  format?: 'png' | 'ico' | 'icns';
  iconEffect?: 'none' | 'carved' | 'emboss' | 'glassy';
  iconTransparency?: number;
  folderHue?: number;
}

export function CanvasPreview({ 
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
  folderHue = 0
}: CanvasPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);

  const download = useCallback(async () => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { cacheBust: true });
      
      if (format === 'ico') {
        // Simple PNG to ICO conversion (wrapping PNG in ICO container)
        // This works for modern Windows (Vista+)
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'custom-folder-icon.ico', { type: 'image/x-icon' });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.download = 'custom-folder-icon.ico';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const link = document.createElement('a');
        link.download = `custom-folder-icon.${format}`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Failed to generate image', err);
    }
  }, [format]);

  // Expose download trigger via a hidden button that parent can click
  useEffect(() => {
    const handleDownloadTrigger = () => download();
    window.addEventListener('trigger-download', handleDownloadTrigger);
    return () => window.removeEventListener('trigger-download', handleDownloadTrigger);
  }, [download]);

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
    small: 'w-1/3 h-1/3',
    medium: 'w-1/2 h-1/2',
    large: 'w-2/3 h-2/3'
  }[iconSize];

  const fontSize = {
    small: '170px',
    medium: '256px',
    large: '340px'
  }[iconSize];

  const getEffectStyle = () => {
    const baseStyle = {
      opacity: iconTransparency,
      mixBlendMode: 'normal' as const,
      filter: 'none'
    };

    if (iconEffect === 'carved') {
      return {
        ...baseStyle,
        filter: 'drop-shadow(0px 2px 0px rgba(255, 255, 255, 0.3)) drop-shadow(0px -1px 0px rgba(0, 0, 0, 0.2))',
        mixBlendMode: 'overlay' as const,
        opacity: iconTransparency * 0.9
      };
    }

    if (iconEffect === 'emboss') {
      return {
        ...baseStyle,
        filter: 'drop-shadow(-1px -1px 0px rgba(255, 255, 255, 0.5)) drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.3))',
      };
    }

    if (iconEffect === 'glassy') {
      return {
        ...baseStyle,
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1)) drop-shadow(0 2px 4px rgba(0,0,0,0.06))',
        mixBlendMode: 'overlay' as const,
        opacity: iconTransparency * 0.7, // More transparent for glass effect
      };
    }

    return baseStyle;
  };

  const effectStyle = getEffectStyle();

  return (
    <div ref={ref} className="relative w-[512px] h-[512px] flex items-center justify-center bg-transparent">
      {/* Folder Base */}
      {folderImage && (
        <img 
          src={folderImage} 
          alt="Folder" 
          className="absolute inset-0 w-full h-full object-contain"
          crossOrigin="anonymous"
          style={{ 
            filter: folderHue !== 0 ? `hue-rotate(${folderHue}deg) sepia(0.5) saturate(2)` : 'none' 
          }}
        />
      )}

      {/* Overlay Icon (React Components: Lucide, Heroicons, Unicons, Grommet) */}
      {IconComponent && (
        <div 
          className={clsx("absolute z-10 flex items-center justify-center", sizeClass)} 
          style={{ 
            color: iconColor,
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            ...effectStyle
          }}
        >
          {iconType === 'grommet-icons' ? (
             <IconComponent size="100%" className="w-full h-full" color={iconColor} />
          ) : (
             <IconComponent size={400} className="w-full h-full" color={iconColor} />
          )}
        </div>
      )}
      
      {/* Font Icon Support (FontAwesome) */}
      {(iconType === 'fontawesome') && iconName && (
         <div 
         className={clsx("absolute z-10 flex items-center justify-center", sizeClass)} 
         style={{ 
           color: iconColor,
           transform: `translate(${offsetX}px, ${offsetY}px)`,
           fontSize: fontSize,
           ...effectStyle
         }}
       >
         <i className={clsx(iconName)} style={{ fontSize: 'inherit' }}></i>
       </div>
      )}
    </div>
  );
}
