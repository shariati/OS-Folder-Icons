import { ReactNode } from 'react';
import { NeumorphBox } from './NeumorphBox';
import { NeumorphButton } from './NeumorphButton';
import { clsx } from 'clsx';

export interface ToggleGroupItem {
  value: string;
  label: string;
  icon?: ReactNode;
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
}: ToggleGroupProps) {
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
      />
    );
  });

  const containerClasses = clsx(
    padding,
    'flex items-center justify-between gap-2 space-y-0',
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
