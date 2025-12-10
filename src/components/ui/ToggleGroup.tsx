import { ReactNode } from 'react';
import { NeumorphBox } from './NeumorphBox';
import { NeumorphButton } from './NeumorphButton';
import { clsx } from 'clsx';

import { StaticImageData } from 'next/image';

export interface ToggleGroupItem {
  value: string;
  label: string;
  icon?: ReactNode;
  imageSrc?: string | StaticImageData;
  imageAlt?: string;
  imageStyle?: React.CSSProperties;
}

interface ToggleGroupProps {
  /**
   * List of items to toggle between.
   */
  items: ToggleGroupItem[];

  /**
   * The currently selected value.
   */
  value: string;

  /**
   * Callback when an item is selected.
   */
  onChange: (value: string) => void;

  /**
   * Optional custom className.
   */
  className?: string;

  /**
   * Size of the buttons.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional title for the group.
   */
  title?: string;
  /**
   * Visual variant of the container box.
   * @default 'flat'
   */
  variant?: 'flat' | 'pressed' | 'none';
  /**
   * Tailwind padding class for the container.
   * @default 'p-2'
   */
  padding?: string;
  /**
   * Grid size for desktop/default.
   * If provided, switches layout to grid.
   * @default 5
   */
  gridSize?: 2 | 3 | 4 | 5 | 6 | 7 | 8;
  gridSizeSm?: number;
  gridSizeMd?: number;
}

export function ToggleGroup({
  items,
  value,
  onChange,
  className,
  size = 'md',
  title,
  variant = 'flat',
  padding = 'p-2',
  gridSize,
  gridSizeSm,
  gridSizeMd,
}: ToggleGroupProps) {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
  } as const;

  const isGrid = gridSize !== undefined || gridSizeSm !== undefined || gridSizeMd !== undefined;
  const baseGridClass = gridSize ? gridClasses[gridSize] : 'grid-cols-5';
  const content = items.map((item) => {
    const isActive = value === item.value;
    return (
      <NeumorphButton
        key={item.value}
        onClick={() => onChange(item.value)}
        variant={isActive ? 'pressed' : 'neumorph'}
        isActive={isActive}
        className="flex-1 py-3 text-sm"
        size={size}
        icon={item.icon}
        label={item.label}
        imageSrc={item.imageSrc}
        imageAlt={item.imageAlt}
        imageStyle={item.imageStyle}
      />
    );
  });

  const containerClasses = clsx(
    padding,
    !isGrid && 'flex items-center justify-between gap-2 space-y-0',
    isGrid && [
      'grid gap-2',
      gridSizeSm ? gridClasses[gridSizeSm as keyof typeof gridClasses] : 'grid-cols-2',
      // Actually, mimic NeumorphIconGrid logic:
      gridSizeSm && gridClasses[gridSizeSm as keyof typeof gridClasses],
      gridSizeMd &&
        `md:${gridClasses[gridSizeMd as keyof typeof gridClasses].replace('grid-cols-', 'grid-cols-')}`,
      gridSize && `lg:${gridClasses[gridSize]}`,
    ],
    isGrid && gridSize && !gridSizeSm && !gridSizeMd ? gridClasses[gridSize] : '',

    isGrid && [],

    !title && className
  );

  const group =
    variant === 'none' ? (
      <div className={containerClasses}>{content}</div>
    ) : (
      <NeumorphBox variant={variant as 'flat' | 'pressed'} className={containerClasses}>
        {content}
      </NeumorphBox>
    );

  if (title) {
    return (
      <div className={className}>
        <label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
          {title}
        </label>
        {group}
      </div>
    );
  }

  return group;
}
