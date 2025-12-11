import React, { ElementType, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Edit2, Trash2 } from 'lucide-react';

interface NeumorphBoxProps<T extends ElementType> {
  children?: ReactNode;
  variant?: 'flat' | 'pressed';
  as?: T;
  className?: string;
  icon?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  customActions?: ReactNode;
  actionsClassName?: string;
  hasBar?: boolean;
}

export function NeumorphBox<T extends ElementType = 'div'>({
  children,
  variant = 'flat',
  as,
  className,
  icon,
  title,
  subtitle,
  badge,
  helperText,
  error,
  showActions,
  onEdit,
  onDelete,
  customActions,
  actionsClassName,
  hasBar = false,
  ...props
}: NeumorphBoxProps<T> & React.ComponentPropsWithoutRef<T>) {
  const Component = as || 'div';

  const hasHeader = !!(icon || title || subtitle || badge);
  const hasFooter = !!(helperText || error);
  const hasActions = !!(showActions || customActions);
  const isVoid = typeof as === 'string' && ['input', 'img', 'br', 'hr'].includes(as);

  if (isVoid) {
    return (
      <Component
        className={twMerge(clsx(variant === 'flat' ? 'neu-flat' : 'neu-pressed', className))}
        {...props}
      />
    );
  }

  return (
    <Component
      className={twMerge(
        clsx(
          variant === 'flat' ? 'neu-flat' : 'neu-pressed',
          'relative',
          'space-y-6 rounded-xl bg-white p-8',
          hasBar && 'overflow-hidden',
          className
        )
      )}
      {...props}
    >
      {hasBar && (
        <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      )}
      {hasHeader && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {icon && <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">{icon}</div>}
            <div className="flex min-w-0 flex-col">
              {title && (
                <h3 className="mb-1 text-lg font-bold text-gray-700 dark:text-white">{title}</h3>
              )}
              {subtitle && (
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
      )}

      {children}

      {hasActions && (
        <div className={twMerge('mt-4 flex items-center justify-end gap-3', actionsClassName)}>
          {customActions}
          {showActions && (
            <>
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="rounded-lg p-1.5 text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {hasFooter && (
        <div className="mt-2 text-sm">
          {error ? (
            <p className="font-medium text-red-500">{error}</p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">{helperText}</p>
          )}
        </div>
      )}
    </Component>
  );
}
