import React, { ElementType, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  ...props
}: NeumorphBoxProps<T> & React.ComponentPropsWithoutRef<T>) {
  const Component = as || 'div';
  
  const hasHeader = !!(icon || title || subtitle || badge);
  const hasFooter = !!(helperText || error);
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
                 {title && <h3 className="font-bold text-gray-800 dark:text-white truncate">{title}</h3>}
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
