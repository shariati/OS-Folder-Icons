'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Image as ImageIcon, Loader2, Check, ExternalLink } from 'lucide-react';
import { ref, listAll, getMetadata, getDownloadURL, StorageReference } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import { formatDateTime, formatTimeAgo, formatSize } from '@/lib/format';
import clsx from 'clsx';

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

export function MediaLibraryModal({ isOpen, onClose, onSelect, folder = 'uploads' }: MediaLibraryModalProps) {
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
            getDownloadURL(itemRef)
          ]);

          const file: StorageFile = {
            name: metadata.name,
            url: url,
            fullPath: metadata.fullPath,
            timeCreated: new Date(metadata.timeCreated),
            size: metadata.size,
            contentType: metadata.contentType,
            ref: itemRef
          };
          return file;
        } catch (err) {
          console.warn(`Failed to fetch metadata for ${itemRef.fullPath}`, err);
          return null;
        }
      });

      const fetchedFiles = (await Promise.all(filePromises)).filter((f): f is StorageFile => f !== null);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="text-blue-500" size={20} />
            Media Library
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              /{folder}
            </span>
          </h3>
          <div className="flex items-center gap-2">
             <button
              onClick={fetchFiles}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0 custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-gray-500">Loading library...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <p className="text-red-500">{error}</p>
                <button 
                  onClick={fetchFiles}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : files.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700">
                  <ImageIcon size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500">No images found in this folder.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {files.map((file) => (
                  <button
                    key={file.fullPath}
                    onClick={() => setSelectedFile(file)}
                    className={clsx(
                      "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02]",
                      selectedFile?.fullPath === file.fullPath
                        ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg z-10"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-md"
                    )}
                  >
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="w-full h-full object-cover bg-gray-100 dark:bg-gray-900"
                      loading="lazy"
                    />
                    <div className={clsx(
                      "absolute inset-0 bg-black/40 transition-opacity flex flex-col justify-end p-3",
                      selectedFile?.fullPath === file.fullPath ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      <p className="text-white text-xs font-medium truncate w-full text-left">
                        {file.name}
                      </p>
                      <p className="text-gray-300 text-[10px] text-left">
                        {formatTimeAgo(file.timeCreated)}
                      </p>
                    </div>
                    {selectedFile?.fullPath === file.fullPath && (
                      <div className="absolute top-2 right-2 p-1 bg-blue-500 rounded-full text-white shadow-sm">
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
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 overflow-y-auto shrink-0 hidden md:block">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">File Details</h4>
              
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 mb-4">
                <img 
                  src={selectedFile.url} 
                  alt={selectedFile.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</label>
                  <p className="text-sm text-gray-900 dark:text-gray-200 break-all">{selectedFile.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Size</label>
                    <p className="text-sm text-gray-900 dark:text-gray-200">{formatSize(selectedFile.size)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
                    <p className="text-sm text-gray-900 dark:text-gray-200">{selectedFile.contentType || 'Unknown'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</label>
                  <p className="text-sm text-gray-900 dark:text-gray-200">
                    {formatDateTime(selectedFile.timeCreated)}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">URL</label>
                  <div className="flex gap-2 mt-1">
                    <input 
                      type="text" 
                      readOnly 
                      value={selectedFile.url}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400"
                    />
                    <a 
                      href={selectedFile.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded"
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
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <div className="text-sm text-gray-500">
            {files.length} items
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedFile}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
