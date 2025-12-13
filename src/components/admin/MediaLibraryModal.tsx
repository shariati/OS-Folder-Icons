'use client';

import clsx from 'clsx';
import { getDownloadURL, getMetadata, listAll, ref, StorageReference } from 'firebase/storage';
import { Check, ExternalLink, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { storage } from '@/lib/firebase/client';
import { formatDateTime, formatSize, formatTimeAgo } from '@/lib/format';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  folder?: string;
}

interface StorageFile {
  name: string;
  url: string;
  fullPath: string;
  timeCreated: Date;
  size: number;
  contentType?: string;
  ref: StorageReference;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  folder = 'uploads',
}: MediaLibraryModalProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);

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

  const fetchFiles = useCallback(async () => {
    if (!storage || !isOpen) return;

    setIsLoading(true);
    setError(null);
    setFiles([]);

    try {
      const folderRef = ref(storage, folder);
      const res = await listAll(folderRef);

      const filePromises = res.items.map(async (itemRef) => {
        try {
          const [metadata, url] = await Promise.all([
            getMetadata(itemRef),
            getDownloadURL(itemRef),
          ]);

          const file: StorageFile = {
            name: metadata.name,
            url: url,
            fullPath: metadata.fullPath,
            timeCreated: new Date(metadata.timeCreated),
            size: metadata.size,
            contentType: metadata.contentType,
            ref: itemRef,
          };
          return file;
        } catch (err) {
          console.warn(`Failed to fetch metadata for ${itemRef.fullPath}`, err);
          return null;
        }
      });

      const fetchedFiles = (await Promise.all(filePromises)).filter(
        (f): f is StorageFile => f !== null
      );

      // Sort by newest first
      fetchedFiles.sort((a, b) => b.timeCreated.getTime() - a.timeCreated.getTime());

      setFiles(fetchedFiles);
    } catch (err) {
      console.error('Error listing files:', err);
      setError('Failed to load images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, folder]);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
      setSelectedFile(null);
    }
  }, [isOpen, fetchFiles]);

  const handleSelect = () => {
    if (selectedFile) {
      onSelect(selectedFile.url);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 flex h-[80vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <ImageIcon className="text-blue-500" size={20} />
            Media Library
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              /{folder}
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchFiles}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              title="Refresh"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Grid */}
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <Loader2 size={40} className="animate-spin text-blue-500" />
                <p className="text-gray-500">Loading library...</p>
              </div>
            ) : error ? (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={fetchFiles}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            ) : files.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                  <ImageIcon size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500">No images found in this folder.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {files.map((file) => (
                  <button
                    key={file.fullPath}
                    onClick={() => setSelectedFile(file)}
                    className={clsx(
                      'group relative aspect-square overflow-hidden rounded-xl border-2 transition-all hover:scale-[1.02]',
                      selectedFile?.fullPath === file.fullPath
                        ? 'z-10 border-blue-500 shadow-lg ring-2 ring-blue-500/20'
                        : 'border-gray-200 hover:border-blue-400 hover:shadow-md dark:border-gray-700'
                    )}
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-full w-full bg-gray-100 object-cover dark:bg-gray-900"
                      loading="lazy"
                    />
                    <div
                      className={clsx(
                        'absolute inset-0 flex flex-col justify-end bg-black/40 p-3 transition-opacity',
                        selectedFile?.fullPath === file.fullPath
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      )}
                    >
                      <p className="w-full truncate text-left text-xs font-medium text-white">
                        {file.name}
                      </p>
                      <p className="text-left text-[10px] text-gray-300">
                        {formatTimeAgo(file.timeCreated)}
                      </p>
                    </div>
                    {selectedFile?.fullPath === file.fullPath && (
                      <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1 text-white shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar / Details */}
          {selectedFile && (
            <div className="hidden w-80 shrink-0 overflow-y-auto border-l border-gray-200 bg-gray-50 p-6 md:block dark:border-gray-700 dark:bg-gray-800/50">
              <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">File Details</h4>

              <div className="mb-4 aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-900">
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Filename
                  </label>
                  <p className="break-all text-sm text-gray-900 dark:text-gray-200">
                    {selectedFile.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Size
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-200">
                      {formatSize(selectedFile.size)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Type
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-200">
                      {selectedFile.contentType || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Uploaded
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-200">
                    {formatDateTime(selectedFile.timeCreated)}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    URL
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedFile.url}
                      className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400"
                    />
                    <a
                      href={selectedFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                      title="Open in new tab"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
          <div className="text-sm text-gray-500">{files.length} items</div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedFile}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={16} />
              Select Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
