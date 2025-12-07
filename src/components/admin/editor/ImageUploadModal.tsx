'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Loader2, Check } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleInsert = () => {
    if (!uploadedUrl) return;
    
    const styleClass = IMAGE_STYLES.find(s => s.id === selectedStyle)?.class || '';
    const sizeClass = IMAGE_SIZES.find(s => s.id === selectedSize)?.class || '';
    const combinedClass = [styleClass, sizeClass, 'my-4'].filter(Boolean).join(' ');
    
    onImageInsert(uploadedUrl, altText, combinedClass);
    onClose();
  };

  const handleUrlInsert = () => {
    const url = uploadedUrl || '';
    if (!url) return;
    
    const styleClass = IMAGE_STYLES.find(s => s.id === selectedStyle)?.class || '';
    const sizeClass = IMAGE_SIZES.find(s => s.id === selectedSize)?.class || '';
    const combinedClass = [styleClass, sizeClass, 'my-4'].filter(Boolean).join(' ');
    
    onImageInsert(url, altText, combinedClass);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Insert Image
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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
                  "relative rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-4 p-8",
                  isDragging 
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                    : "border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                  isUploading && "pointer-events-none opacity-60"
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={40} className="text-purple-500 animate-spin" />
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700">
                        <Upload size={32} className="text-gray-400" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-purple-500">
                        <Upload size={12} className="text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span className="text-purple-500 underline">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Maximum 3 files, 5MB each.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              {/* URL Input Option */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-400">or paste URL</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
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
                    const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                    if (input?.value) {
                      setUploadedUrl(input.value);
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                >
                  Use URL
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Preview */}
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-video flex items-center justify-center">
                  <img 
                    src={uploadedUrl} 
                    alt={altText || 'Preview'}
                    className="max-w-full max-h-full object-contain"
                  />
                  <button
                    onClick={() => setUploadedUrl(null)}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>

                {/* Alt Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                {/* Style Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {IMAGE_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          selectedStyle === style.id
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        )}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {IMAGE_SIZES.map(size => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          selectedSize === size.id
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium transition-colors"
            >
              <Check size={16} />
              Insert Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
