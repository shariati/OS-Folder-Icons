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

export function EmptyState({ title, description, actionLabel, onAction, imageSrc }: EmptyStateProps) {
  return (
    <NeumorphBox className="flex flex-col items-center justify-center p-12 text-center space-y-6 min-h-[400px]">
      <div className="relative w-48 h-48 mb-4 opacity-80">
        {imageSrc ? (
           <Image 
              src={imageSrc} 
              alt="Empty State" 
              fill 
              className="object-contain"
           />
        ) : (
           // Placeholder generic empty state illustration if no image provided
           <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
             <span className="text-4xl">📄</span>
           </div>
        )}
      </div>
      
      <div className="max-w-md space-y-2">
        <h3 className="text-xl font-bold text-black dark:text-white">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
        >
          <Plus size={20} />
          {actionLabel}
        </button>
      )}
    </NeumorphBox>
  );
}
