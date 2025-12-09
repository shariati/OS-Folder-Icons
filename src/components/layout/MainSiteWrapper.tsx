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

export function MainSiteWrapper({ children, className, header, tagline, preHeader }: MainSiteWrapperProps) {
  return (
    <main 
      className={twMerge(
        "flex-grow pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full",
        className
      )}
    >
      {(header || tagline || preHeader) && (
        <div className="mb-10 text-center">
          {preHeader && (
            <div className="mb-3">
               {typeof preHeader === 'string' ? (
                 <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase text-sm block">
                   {preHeader}
                 </span>
               ) : preHeader}
            </div>
          )}
          {header && (
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{header}</h1>
          )}
          {tagline && (
            <div className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              {tagline}
            </div>
          )}
        </div>
      )}
      {children}
    </main>
  );
}
