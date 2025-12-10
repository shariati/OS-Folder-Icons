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
  minHeight = 'min-h-[400px]',
  title = 'Preview',
  cover = false,
}: PreviewPanelProps) {
  return (
    <div className="glass-panel relative overflow-hidden p-8">
      <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
          <div className="h-3 w-3 rounded-full bg-green-400"></div>
        </div>
      </div>

      <NeumorphBox
        variant="pressed"
        className={clsx(
          'checkerboard mb-6 flex items-center justify-center overflow-auto rounded-2xl bg-gray-100/50 dark:bg-gray-900/50',
          cover ? 'p-0' : 'p-4',
          minHeight
        )}
      >
        {children}
      </NeumorphBox>

      {controls && <div className="mb-6">{controls}</div>}

      {(actions || footerText) && (
        <div className="mx-auto max-w-md space-y-4">
          {actions}
          {footerText && (
            <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {footerText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
