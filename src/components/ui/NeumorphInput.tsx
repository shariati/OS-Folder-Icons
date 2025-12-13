import { clsx } from 'clsx';
import React, { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';
import { twMerge } from 'tailwind-merge';

export interface NeumorphInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const NeumorphInput = forwardRef<HTMLInputElement, NeumorphInputProps>(
  (
    {
      className,
      containerClassName,
      label,
      icon,
      iconPosition = 'left',
      error,
      hint,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasIcon = !!icon;

    return (
      <div className={twMerge('flex flex-col gap-2', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'ml-1 text-sm font-bold text-gray-700 transition-opacity dark:text-gray-200',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {hasIcon && iconPosition === 'left' && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={twMerge(
              // Base styles
              'w-full rounded-xl bg-gray-100 p-4 text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 dark:bg-gray-800 dark:text-gray-200',
              // Neumorphic pressed style (inset shadow)
              'neu-pressed',
              // Icon padding
              hasIcon && iconPosition === 'left' && 'pl-12',
              hasIcon && iconPosition === 'right' && 'pr-12',
              // Error state
              error && 'ring-2 ring-red-500/50',
              // Disabled state
              disabled && 'cursor-not-allowed opacity-60',
              className
            )}
            {...props}
          />

          {hasIcon && iconPosition === 'right' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
          )}
        </div>

        {/* Error or Hint */}
        {(error || hint) && (
          <div className="ml-1 text-xs">
            {error ? (
              <span className="font-medium text-red-500">{error}</span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">{hint}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

NeumorphInput.displayName = 'NeumorphInput';
