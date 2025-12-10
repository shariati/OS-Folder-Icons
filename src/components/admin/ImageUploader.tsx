'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';
import { MediaLibraryModal } from './MediaLibraryModal';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
}

export function ImageUploader({
  value,
  onChange,
  folder = 'uploads',
  className,
  aspectRatio = 'video',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
  };

  const handleUpload = useCallback(
    async (file: File) => {
      if (!storage) {
        setError('Storage not initialized');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        // Generate unique filename with UUID
        const fileExtension = file.name.split('.').pop() || 'png';
        const filename = `${uuidv4()}.${fileExtension}`;

        const storageRef = ref(storage, `${folder}/${filename}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        onChange(downloadUrl);
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleRemove = useCallback(() => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  return (
    <div className={clsx('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        // Image Preview
        <div
          className={clsx(
            'group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700',
            aspectClasses[aspectRatio]
          )}
        >
          <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
              >
                Upload New
              </button>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(true)}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
              >
                Browse Library
              </button>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        // Upload Zone
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={clsx(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all',
            aspectClasses[aspectRatio],
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800/50',
            isUploading && 'pointer-events-none opacity-60'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <span className="text-sm text-gray-500">Uploading...</span>
            </>
          ) : (
            <>
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <Upload size={24} className="text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Drop an image here, or{' '}
                  <span className="text-blue-500 hover:text-blue-600">upload</span>
                </p>
                <div className="mt-2 flex flex-col items-center gap-1">
                  <p className="text-xs text-gray-400">PNG, JPG, WebP up to 5MB</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLibraryOpen(true);
                    }}
                    className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    <ImageIcon size={12} />
                    Browse Media Library
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <MediaLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setIsLibraryOpen(false);
        }}
        folder={folder}
      />
    </div>
  );
}
