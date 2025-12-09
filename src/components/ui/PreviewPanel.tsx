import React, { ReactNode } from 'react';
import { clsx } from 'clsx';
import { NeumorphBox } from './NeumorphBox';

interface PreviewPanelProps {
  children: ReactNode;
  controls?: ReactNode;
  actions?: ReactNode;
  footerText?: ReactNode;
  minHeight?: string;
  title?: string;
  cover?: boolean;
}

export function PreviewPanel({
  children,
  controls,
  actions,
  footerText,
  minHeight = "min-h-[400px]",
  title = "Preview",
  cover = false
}: PreviewPanelProps) {
  return (
    <div className="glass-panel p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
      </div>

      <NeumorphBox 
        variant="pressed"
        className={clsx(
          "flex justify-center mb-6 bg-gray-100/50 dark:bg-gray-900/50 rounded-2xl checkerboard flex items-center overflow-auto",
          cover ? "p-0" : "p-4",
          minHeight
        )}
      >
        {children}
      </NeumorphBox>
      
      {controls && (
        <div className="mb-6">
          {controls}
        </div>
      )}

      {(actions || footerText) && (
        <div className="space-y-4 max-w-md mx-auto">
          {actions}
          {footerText && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
              {footerText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
