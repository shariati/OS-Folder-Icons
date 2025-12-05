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
        className={twMerge(
          clsx(
            variant === 'flat' ? 'neu-flat' : 'neu-pressed',
            className
          )
        )}
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
          'rounded-xl bg-white p-8 space-y-6',
          className
        )
      )}
      {...props}
    >
      {hasHeader && (
        <div className="flex items-start justify-between mb-4 gap-4">
           <div className="flex items-center gap-3 overflow-hidden">
              {icon && <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">{icon}</div>}
              <div className="flex flex-col min-w-0">
                 {title && <h3 className="text-lg font-bold mb-1 text-gray-700 dark:text-white">{title}</h3>}
                 {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>}
              </div>
           </div>
           {badge && (
             <div className="flex-shrink-0">
               {badge}
             </div>
           )}
        </div>
      )}
      
      {children}

      {hasActions && (
        <div className={twMerge("flex justify-end items-center gap-3 mt-4", actionsClassName)}>
          {customActions}
          {showActions && (
            <>
              {onEdit && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="text-blue-500 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded-lg"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-red-500 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
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
             <p className="text-red-500 font-medium">{error}</p>
           ) : (
             <p className="text-gray-500 dark:text-gray-400">{helperText}</p>
           )}
        </div>
      )}
    </Component>
  );
}
