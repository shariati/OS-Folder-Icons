import React from 'react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { Plus } from 'lucide-react';
import Image from 'next/image';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  imageSrc?: string; // Optional custom image
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  imageSrc,
}: EmptyStateProps) {
  return (
    <NeumorphBox className="flex min-h-[400px] flex-col items-center justify-center space-y-6 p-12 text-center">
      <div className="relative mb-4 h-48 w-48 opacity-80">
        {imageSrc ? (
          <Image src={imageSrc} alt="Empty State" fill className="object-contain" />
        ) : (
          // Placeholder generic empty state illustration if no image provided
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <span className="text-4xl">📄</span>
          </div>
        )}
      </div>

      <div className="max-w-md space-y-2">
        <h3 className="text-xl font-bold text-black dark:text-white">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-primary shadow-primary/30 flex items-center gap-2 rounded-lg px-8 py-3 font-medium text-white shadow-lg transition-all hover:bg-opacity-90"
        >
          <Plus size={20} />
          {actionLabel}
        </button>
      )}
    </NeumorphBox>
  );
}
