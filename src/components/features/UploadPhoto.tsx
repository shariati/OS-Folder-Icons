import React from 'react';
import { Upload } from 'lucide-react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';

interface UploadPhotoProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  inputId?: string;
}

export function UploadPhoto({ onUpload, className, inputId }: UploadPhotoProps) {
  return (
    <NeumorphBox title="Upload Photo" subtitle="Choose your memory" className={className}>
      <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800/50">
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          <Upload className="mb-3 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-bold">Click to upload</span> or drag and drop
          </p>
        </div>
        <input id={inputId} type="file" className="hidden" accept="image/*" onChange={onUpload} />
      </label>
    </NeumorphBox>
  );
}
