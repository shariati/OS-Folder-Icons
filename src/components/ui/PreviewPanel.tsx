import React, { ReactNode } from 'react';
import { clsx } from 'clsx';
import { NeumorphBox } from './NeumorphBox';
import { Desktop, DesktopProps } from './Desktop';

interface BasePreviewPanelProps {
  theme?: 'macOS' | 'none';
  title?: string;
  subtitle?: string;
  hint?: ReactNode;
  actionButton?: ReactNode;
  controls?: ReactNode;
  minHeight?: string;
  className?: string;
}

interface DesktopPreviewPanelProps extends BasePreviewPanelProps {
  variant: 'desktop';
  desktopProps: DesktopProps;
  children?: never;
}

interface CustomPreviewPanelProps extends BasePreviewPanelProps {
  variant?: 'custom'; // Optional default
  children: ReactNode;
  desktopProps?: never;
}

type PreviewPanelProps = DesktopPreviewPanelProps | CustomPreviewPanelProps;

export function PreviewPanel({
  theme = 'macOS',
  title = 'Preview',
  subtitle,
  hint,
  actionButton,
  controls,
  minHeight = 'min-h-[400px]',
  className,
  ...props
}: PreviewPanelProps) {
  return (
    <div className={clsx('glass-panel relative overflow-hidden p-8', className)}>
      <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>

        {theme === 'macOS' && (
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
            <div className="h-3 w-3 rounded-full bg-green-400"></div>
          </div>
        )}
      </div>

      <NeumorphBox
        variant="pressed"
        className={clsx(
          'checkerboard mb-6 flex items-center justify-center overflow-hidden rounded-2xl bg-gray-100/50 dark:bg-gray-900/50',
          props.variant === 'custom' || !props.variant ? 'p-4' : 'p-0',
          minHeight
        )}
      >
        {props.variant === 'desktop' ? (
          <Desktop {...props.desktopProps} className="h-full w-full" />
        ) : (
          props.children
        )}
      </NeumorphBox>

      {controls && <div className="mb-6">{controls}</div>}

      {actionButton && <div className="mb-6">{actionButton}</div>}

      {hint && (
        <div className="mx-auto max-w-md text-center text-sm font-medium text-gray-500 dark:text-gray-400">
          {hint}
        </div>
      )}
    </div>
  );
}
