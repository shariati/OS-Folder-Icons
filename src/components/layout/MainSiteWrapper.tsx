import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MainSiteWrapperProps {
  children: React.ReactNode;
  className?: string;
  header?: string | React.ReactNode;
  tagline?: string | React.ReactNode;
  preHeader?: string | React.ReactNode;
}

export function MainSiteWrapper({
  children,
  className,
  header,
  tagline,
  preHeader,
}: MainSiteWrapperProps) {
  return (
    <main
      className={twMerge(
        'mx-auto w-full max-w-7xl flex-grow px-4 pb-12 pt-32 sm:px-6 lg:px-8',
        className
      )}
    >
      {(header || tagline || preHeader) && (
        <div className="mb-10 text-center">
          {preHeader && (
            <div className="mb-3">
              {typeof preHeader === 'string' ? (
                <span className="block text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  {preHeader}
                </span>
              ) : (
                preHeader
              )}
            </div>
          )}
          {header && (
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">{header}</h1>
          )}
          {tagline && (
            <div className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-gray-400">
              {tagline}
            </div>
          )}
        </div>
      )}
      {children}
    </main>
  );
}
