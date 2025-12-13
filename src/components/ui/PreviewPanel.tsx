import { clsx } from 'clsx';
import React, { ReactNode } from 'react';

import { Desktop, DesktopProps } from './Desktop';
import { NeumorphBox } from './NeumorphBox';

interface BasePreviewPanelProps {
  theme?: 'macOS' | 'none';
  title?: string;
  subtitle?: string;
  hint?: ReactNode;
  actionButton?: ReactNode;
  controls?: ReactNode;
  minHeight?: string;
  className?: string;
  hasBar?: boolean;
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
  hasBar = true,
  className,
  ...props
}: PreviewPanelProps) {
  return (
    <NeumorphBox
      title={title}
      subtitle={subtitle}
      hasBar={hasBar}
      badge={
        theme === 'macOS' && (
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
            <div className="h-3 w-3 rounded-full bg-green-400"></div>
          </div>
        )
      }
      className={clsx('relative overflow-hidden p-8', className)}
    >
      <NeumorphBox
        variant="pressed"
        className={clsx(
          'mb-6 overflow-hidden rounded-2xl bg-gray-100/50 dark:bg-gray-900/50',
          props.variant === 'custom' || !props.variant
            ? 'flex items-center justify-center p-4'
            : 'flex flex-col p-0'
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
    </NeumorphBox>
  );
}
