'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Loader2, Check, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';
import { MediaLibraryModal } from '../MediaLibraryModal';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageInsert: (url: string, alt: string, className?: string) => void;
}

const IMAGE_STYLES = [
  { id: 'none', label: 'None', class: '' },
  { id: 'rounded', label: 'Rounded', class: 'rounded-lg' },
  { id: 'rounded-xl', label: 'Extra Rounded', class: 'rounded-xl' },
  { id: 'shadow', label: 'Shadow', class: 'shadow-lg' },
  { id: 'rounded-shadow', label: 'Rounded + Shadow', class: 'rounded-xl shadow-lg' },
  { id: 'border', label: 'Border', class: 'border border-gray-200 dark:border-gray-700' },
];

const IMAGE_SIZES = [
  { id: 'small', label: 'Small', class: 'max-w-sm' },
  { id: 'medium', label: 'Medium', class: 'max-w-lg' },
  { id: 'large', label: 'Large', class: 'max-w-2xl' },
  { id: 'full', label: 'Full Width', class: 'w-full' },
];

export function ImageUploadModal({ isOpen, onClose, onImageInsert }: ImageUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('rounded-shadow');
  const [selectedSize, setSelectedSize] = useState('full');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUploadedUrl(null);
      setAltText('');
      setSelectedStyle('rounded-shadow');
      setSelectedSize('full');
      setError(null);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleUpload = useCallback(async (file: File) => {
    if (!storage) {
      setError('Storage not initialized');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

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

      const storageRef = ref(storage, `content/${filename}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setUploadedUrl(downloadUrl);
      // Use filename without extension as default alt text
      setAltText(file.name.split('.')[0].replace(/[-_]/g, ' '));
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, []);

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

  const handleInsert = () => {
    if (!uploadedUrl) return;

    const styleClass = IMAGE_STYLES.find((s) => s.id === selectedStyle)?.class || '';
    const sizeClass = IMAGE_SIZES.find((s) => s.id === selectedSize)?.class || '';
    const combinedClass = [styleClass, sizeClass, 'my-4'].filter(Boolean).join(' ');

    onImageInsert(uploadedUrl, altText, combinedClass);
    onClose();
  };

  const handleUrlInsert = () => {
    const url = uploadedUrl || '';
    if (!url) return;

    const styleClass = IMAGE_STYLES.find((s) => s.id === selectedStyle)?.class || '';
    const sizeClass = IMAGE_SIZES.find((s) => s.id === selectedSize)?.class || '';
    const combinedClass = [styleClass, sizeClass, 'my-4'].filter(Boolean).join(' ');

    onImageInsert(url, altText, combinedClass);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Insert Image</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {!uploadedUrl ? (
            <>
              {/* Upload Zone */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={clsx(
                  'relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all',
                  isDragging
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/50',
                  isUploading && 'pointer-events-none opacity-60'
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={40} className="animate-spin text-purple-500" />
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="rounded-xl bg-gray-100 p-4 dark:bg-gray-700">
                        <Upload size={32} className="text-gray-400" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-purple-500 p-1.5">
                        <Upload size={12} className="text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span className="text-purple-500 underline">Click to upload</span> or drag
                        and drop
                      </p>
                      <p className="mt-1 text-xs text-gray-400">Maximum 3 files, 5MB each.</p>
                    </div>
                  </>
                )}
              </div>

              {error && <p className="text-center text-sm text-red-500">{error}</p>}

              {/* URL Input Option */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 dark:bg-gray-800">or paste URL</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value) {
                        setUploadedUrl(input.value);
                      }
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = (e.target as HTMLButtonElement)
                      .previousElementSibling as HTMLInputElement;
                    if (input?.value) {
                      setUploadedUrl(input.value);
                    }
                  }}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Use URL
                </button>
                <div className="mx-2 h-8 w-px self-center bg-gray-200 dark:bg-gray-700" />
                <button
                  onClick={() => setIsLibraryOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40"
                >
                  <ImageIcon size={16} />
                  Browse Library
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Preview */}
              <div className="space-y-4">
                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                  <img
                    src={uploadedUrl}
                    alt={altText || 'Preview'}
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    onClick={() => setUploadedUrl(null)}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-2 transition-colors hover:bg-black/70"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>

                {/* Alt Text */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Style Options */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {IMAGE_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={clsx(
                          'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                          selectedStyle === style.id
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        )}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Options */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {IMAGE_SIZES.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={clsx(
                          'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                          selectedSize === size.id
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        )}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {uploadedUrl && (
          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700/50">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600"
            >
              <Check size={16} />
              Insert Image
            </button>
          </div>
        )}
      </div>

      <MediaLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(url) => {
          setUploadedUrl(url);
          // Try to guess alt text from filename
          try {
            // decipher filename from url
            // decodeURIComponent to handle spaces and special chars
            const decodedUrl = decodeURIComponent(url);
            const pathEnd = decodedUrl.split('?')[0];
            const filename = pathEnd.split('/').pop() || '';
            // Remove UUID if possible (this is tricky as UUID is random, but let's just use what we have)
            // Or just use the full filename but clean it up
            setAltText(filename.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, ''));
          } catch (e) {
            setAltText('Image');
          }
          setIsLibraryOpen(false);
        }}
        folder="content"
      />
    </div>
  );
}
