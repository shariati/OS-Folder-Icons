import { clsx } from 'clsx';
import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { NeumorphBox } from './NeumorphBox';

export interface NeumorphIconGridProps {
  icons: string[];
  selectedIcon: string | null;
  onSelect: (icon: string) => void;
  renderIcon: (name: string) => ReactNode;
  variant?: 'flat' | 'pressed';
  gridSize?: 2 | 3 | 4 | 5 | 6 | 7 | 8;
  gridSizeSm?: number; // Mobile
  gridSizeMd?: number; // Tablet
  className?: string;
}

export function NeumorphIconGrid({
  icons,
  selectedIcon,
  onSelect,
  renderIcon,
  variant = 'pressed',
  gridSize = 6,
  gridSizeSm,
  gridSizeMd,
  className,
}: NeumorphIconGridProps) {
  // Map numeric sizes to Tailwind classes safely
  // Since Tailwind needs complete class names for JIT, we'll use a lookup object
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
  } as const;

  const smGridClasses = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    7: 'sm:grid-cols-7',
    8: 'sm:grid-cols-8',
  } as const;

  // Default SM breakpoint if not provided (usually smaller)

  const baseGridClass = gridClasses[gridSize] || 'grid-cols-6';

  return (
    <NeumorphBox
      variant={variant}
      className={twMerge(
        'custom-scrollbar grid h-64 gap-2 overflow-y-auto rounded-xl p-2',
        // If specific mobile size given:
        gridSizeSm ? gridClasses[gridSizeSm as keyof typeof gridClasses] : 'grid-cols-4', // Default mobile 4

        // If specific tablet size given:
        gridSizeMd
          ? `md:${gridClasses[gridSizeMd as keyof typeof gridClasses].replace('grid-cols-', 'grid-cols-')}`
          : 'md:grid-cols-5', // Default tablet 5

        // Desktop / Default
        `lg:${baseGridClass}`,

        // Apply existing color/bg styles
        'bg-gray-50/50 dark:bg-gray-900/30',
        className
      )}
    >
      {icons.map((name) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={clsx(
            'flex aspect-square items-center justify-center rounded-xl p-2 transition-all',
            selectedIcon === name
              ? 'scale-105 transform bg-blue-500 text-white shadow-lg shadow-blue-500/40' // Selected
              : 'text-gray-500 hover:bg-white hover:shadow-sm dark:hover:bg-gray-700' // Normal
          )}
          title={name}
        >
          {renderIcon(name)}
        </button>
      ))}
    </NeumorphBox>
  );
}
