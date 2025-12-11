import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Image, { StaticImageData } from 'next/image';

export interface NeumorphButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'neumorph' | 'pressed' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
  iconSize?: 'sm' | 'md' | 'lg';
  imageSrc?: string | StaticImageData;
  imageAlt?: string;
  imageStyle?: React.CSSProperties;
  imageSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'; // Extended sizes
  isActive?: boolean;
  label?: string;
}

export function NeumorphButton({
  children,
  className,
  variant = 'neumorph',
  size = 'md',
  orientation = 'horizontal',
  icon,
  iconPosition,
  iconSize,
  imageSrc,
  imageAlt,
  imageStyle,
  imageSize,
  isActive,
  label,
  ...props
}: NeumorphButtonProps) {
  // Determine effective icon position based on orientation if not explicitly provided
  const effectiveIconPosition = iconPosition || (orientation === 'vertical' ? 'top' : 'left');

  // Default icon size to match button size if not provided
  const effectiveIconSize = iconSize || size;

  // Base classes mapping
  const baseClasses =
    'relative transition-all duration-200 outline-none flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant classes
  const variantClasses = {
    neumorph: 'neu-flat text-gray-700 dark:text-gray-200 active:shadow-inner',
    pressed: 'neu-pressed text-blue-600 dark:text-blue-400',
    flat: 'bg-transparent border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-none',
  };

  // If active is true, override variant to pressed style visually (though keep logic distinct if needed)
  const activeClasses = isActive
    ? 'neu-pressed text-blue-600 dark:text-blue-400'
    : variantClasses[variant];

  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-2 px-3 rounded-lg gap-2',
    md: 'text-sm py-3 px-5 rounded-xl gap-3',
    lg: 'text-base py-4 px-8 rounded-2xl gap-4',
  };

  // Orientation classes
  const orientationClasses = orientation === 'vertical' ? 'flex-col' : 'flex-row';

  // Icon Size styling (for wrapper)
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Image size classes
  const imageSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    full: 'w-full h-full aspect-square',
  };

  const effectiveImageSize = imageSize || size;

  const renderIconOrImage = () => {
    if (imageSrc) {
      if (!imageAlt) {
        console.warn('NeumorphButton: imageAlt is required when imageSrc is provided.');
      }
      return (
        <div
          className={clsx(
            'relative shrink-0',
            imageSize ? imageSizeClasses[imageSize] : iconSizeClasses[effectiveIconSize]
          )}
        >
          <Image
            src={imageSrc}
            alt={imageAlt || 'button icon'}
            fill
            sizes="100px"
            className="object-contain"
            style={imageStyle}
          />
        </div>
      );
    }

    if (icon) {
      return (
        <span
          className={clsx(
            'flex shrink-0 items-center justify-center',
            iconSizeClasses[effectiveIconSize]
          )}
        >
          {icon}
        </span>
      );
    }

    return null;
  };

  const content = (
    <>
      {/* Icon/Image if position is left or top */}
      {(effectiveIconPosition === 'left' || effectiveIconPosition === 'top') && renderIconOrImage()}

      {/* Text Content */}

      {label ? (
        <span className="flex flex-col items-center gap-1 leading-tight">
          <span>{label}</span>
          {children && <span className="text-xs font-normal opacity-80">{children}</span>}
        </span>
      ) : (
        children
      )}

      {/* Icon/Image if position is right or bottom */}
      {(effectiveIconPosition === 'right' || effectiveIconPosition === 'bottom') &&
        renderIconOrImage()}
    </>
  );

  return (
    <button
      className={twMerge(
        baseClasses,
        activeClasses,
        sizeClasses[size],
        orientationClasses,
        className
      )}
      {...props}
    >
      {content}
    </button>
  );
}
