'use client';

import { useState, useRef, useEffect } from 'react';
import { OSVersion, FolderIcon } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Upload, X, Trash2, Check, Info } from 'lucide-react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { clsx } from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { uploadToFirebase } from '@/lib/client-upload';
import { useToast } from '@/components/ui/Toast';
import { CanvasPreview } from '@/components/ui/CanvasPreview';

interface VersionFormProps {
  initialData?: Partial<OSVersion>;
  osFormat: 'png' | 'ico' | 'icns' | undefined;
  onSubmit: (version: OSVersion) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function VersionForm({
  initialData,
  osFormat,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: VersionFormProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [wallpaperUrl, setWallpaperUrl] = useState(initialData?.wallpaperUrl || '');
  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null);

  const [defaultFolderUrl, setDefaultFolderUrl] = useState(initialData?.defaultFolderUrl || '');
  const [defaultFolderFile, setDefaultFolderFile] = useState<File | null>(null);
  const [defaultOffsetX, setDefaultOffsetX] = useState(initialData?.defaultOffsetX || 0);
  const [defaultOffsetY, setDefaultOffsetY] = useState(initialData?.defaultOffsetY || 0);

  // Folder Icons State (existing + new pending uploads)
  const [folderIcons, setFolderIcons] = useState<FolderIcon[]>(initialData?.folderIcons || []);
  const [pendingFolderFiles, setPendingFolderFiles] = useState<{ id: string; file: File }[]>([]);

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateImage = async (file: File, allowedSizes: number[] = []): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (allowedSizes.length > 0) {
          if (img.width !== img.height || !allowedSizes.includes(img.width)) {
            resolve(false);
            return;
          }
        }
        resolve(true);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve(false);
      };
    });
  };

  const handleWallpaperUpload = async (file: File) => {
    // No strict size for wallpaper, but let's just preview it
    setWallpaperFile(file);
    setWallpaperUrl(URL.createObjectURL(file));
  };

  const handleDefaultFolderUpload = async (file: File) => {
    const isValid = await validateImage(file, [1024, 512]);
    if (!isValid) {
      showToast('Default folder image must be exactly 1024x1024 or 512x512 pixels.', 'error');
      return;
    }
    setDefaultFolderFile(file);
    setDefaultFolderUrl(URL.createObjectURL(file));
  };

  const handleAddFolderIcon = async (file: File) => {
    const isValid = await validateImage(file, [1024, 512]);
    if (!isValid) {
      showToast('Folder icon must be 1024x1024 or 512x512 pixels.', 'error');
      return;
    }

    const tempId = uuidv4();
    const previewUrl = URL.createObjectURL(file);

    // Add to pending files map
    setPendingFolderFiles((prev) => [...prev, { id: tempId, file }]);

    // Add to UI list
    const newIcon: FolderIcon = {
      id: tempId,
      name: file.name.split('.')[0],
      imageUrl: previewUrl,
      offsetX: defaultOffsetX,
      offsetY: defaultOffsetY,
      isDefault: folderIcons.length === 0, // Make default if it's the first one
    };

    setFolderIcons((prev) => [...prev, newIcon]);
  };

  const handleRemoveFolderIcon = (id: string) => {
    setFolderIcons((prev) => prev.filter((icon) => icon.id !== id));
    setPendingFolderFiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSetDefaultIcon = (id: string) => {
    setFolderIcons((prev) =>
      prev.map((icon) => ({
        ...icon,
        isDefault: icon.id === id,
      }))
    );
  };

  const updateFolderIcon = (id: string, updates: Partial<FolderIcon>) => {
    setFolderIcons((prev) => prev.map((icon) => (icon.id === id ? { ...icon, ...updates } : icon)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Version name is required' });
      return;
    }
    if (folderIcons.length === 0) {
      showToast('Please add at least one folder icon variant.', 'error');
      return;
    }

    try {
      if (!user) {
        showToast('Authentication required', 'error');
        return;
      }

      // 1. Upload global files if changed
      let finalWallpaperUrl = wallpaperUrl;
      if (wallpaperFile) {
        finalWallpaperUrl = await uploadToFirebase(wallpaperFile, user);
      }

      let finalDefaultFolderUrl = defaultFolderUrl;
      if (defaultFolderFile) {
        finalDefaultFolderUrl = await uploadToFirebase(defaultFolderFile, user);
      }

      // 2. Upload pending folder icons
      const finalFolderIcons = await Promise.all(
        folderIcons.map(async (icon) => {
          const pending = pendingFolderFiles.find((p) => p.id === icon.id);
          if (pending) {
            const url = await uploadToFirebase(pending.file, user);
            return { ...icon, imageUrl: url };
          }
          return icon;
        })
      );

      // 3. Construct final object
      const versionData: OSVersion = {
        id: initialData?.id || uuidv4(),
        name,
        wallpaperUrl: finalWallpaperUrl,
        defaultFolderUrl: finalDefaultFolderUrl,
        defaultOffsetX,
        defaultOffsetY,
        folderIcons: finalFolderIcons,
        defaultFolderIconId: finalFolderIcons.find((f) => f.isDefault)?.id,
      };

      await onSubmit(versionData);
    } catch (error) {
      console.error('Submission failed', error);
      showToast('Failed to save version. Please try again.', 'error');
    }
  };

  return (
    <NeumorphBox
      variant="pressed"
      className="animate-fade-in-up flex w-full flex-col overflow-hidden p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {initialData?.id ? 'Edit Version' : 'Add New Version'}
          </h2>
          <p className="text-sm text-gray-500">Configure version details and icon variants.</p>
        </div>
        <button
          onClick={onCancel}
          className="rounded-lg p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={24} className="text-gray-500" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 space-y-8 overflow-y-auto p-8">
        {/* Main Info Section */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            {/* Version Name */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                Version Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={clsx(
                  'w-full rounded-xl border-2 bg-gray-50 px-4 py-3 transition-all focus:outline-none dark:bg-gray-800',
                  errors.name
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-transparent focus:border-blue-500'
                )}
                placeholder='e.g. "11" or "Sequoia"'
              />
              {errors.name && <p className="mt-1 text-xs font-bold text-red-500">{errors.name}</p>}
            </div>

            {/* Default Template Section Removed as requested */}
          </div>

          {/* Wallpaper Section */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
              Preview Wallpaper
            </label>
            <div className="group relative aspect-video overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-200 dark:border-gray-600 dark:bg-gray-800">
              {wallpaperUrl ? (
                <Image src={wallpaperUrl} alt="Wallpaper" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={48} className="mb-2 opacity-50" />
                  <span className="text-sm font-medium">Upload Desktop Wallpaper</span>
                </div>
              )}

              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-lg border border-white/30 bg-white/20 px-4 py-2 font-bold text-white backdrop-blur-md transition-colors hover:bg-white/30">
                  {wallpaperUrl ? 'Change Wallpaper' : 'Upload Wallpaper'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleWallpaperUpload(e.target.files[0]);
                  }}
                />
              </label>
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <Info size={12} />
              Used for live preview background only.
            </p>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Folder Icons Section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Folder Icons</h3>
              <p className="text-sm text-gray-500">
                Add variants for this version (e.g. Empty, Full, Open). Supported: 1024x1024 or
                512x512.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700">
              <Upload size={18} />
              Add Icon Variant
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleAddFolderIcon(e.target.files[0]);
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {folderIcons.length === 0 && (
              <div className="mb-4 rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400 dark:border-gray-700">
                No icons added yet. Upload your first variant.
              </div>
            )}

            {folderIcons.map((icon, idx) => (
              <NeumorphBox key={icon.id} className="group relative overflow-hidden p-6">
                {/* "Default" Badge */}
                {icon.isDefault && (
                  <div className="absolute right-0 top-0 z-10 rounded-bl-xl bg-amber-400 px-3 py-1 text-xs font-bold text-amber-900 shadow-sm">
                    Default Icon
                  </div>
                )}

                <div className="flex flex-col items-start gap-8 lg:flex-row">
                  {/* Icon Preview & Basic Info */}
                  <div className="flex w-32 flex-shrink-0 flex-col gap-3">
                    <div className="relative h-32 w-32 rounded-xl border border-gray-200 bg-gray-100 p-2 dark:border-gray-700 dark:bg-gray-800">
                      <Image
                        src={icon.imageUrl}
                        alt={icon.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <input
                      type="text"
                      value={icon.name}
                      onChange={(e) => updateFolderIcon(icon.id, { name: e.target.value })}
                      className="w-full border-b border-transparent bg-transparent py-1 text-center text-sm font-bold focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Controls */}
                  <div className="w-full flex-1 space-y-6">
                    {/* Sliders */}
                    <div className="grid grid-cols-1 gap-6 rounded-xl bg-gray-50 p-4 sm:grid-cols-2 dark:bg-gray-800/50">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-xs font-bold uppercase text-gray-500">
                            Offset X
                          </label>
                          <span className="font-mono text-xs">{icon.offsetX || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          value={icon.offsetX || 0}
                          onChange={(e) =>
                            updateFolderIcon(icon.id, { offsetX: Number(e.target.value) })
                          }
                          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-500 dark:bg-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-xs font-bold uppercase text-gray-500">
                            Offset Y
                          </label>
                          <span className="font-mono text-xs">{icon.offsetY || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          value={icon.offsetY || 0}
                          onChange={(e) =>
                            updateFolderIcon(icon.id, { offsetY: Number(e.target.value) })
                          }
                          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-500 dark:bg-gray-700"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      {!icon.isDefault && (
                        <button
                          onClick={() => handleSetDefaultIcon(icon.id)}
                          type="button"
                          className="px-2 text-sm font-bold text-amber-600 hover:text-amber-700 hover:underline"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveFolderIcon(icon.id)}
                        type="button"
                        className="ml-auto px-2 text-sm font-bold text-red-500 hover:text-red-600 hover:underline"
                      >
                        Remove Variant
                      </button>
                    </div>
                  </div>

                  {/* Live Canvas Preview (Enlarged) */}
                  <div className="relative hidden h-[300px] w-[300px] flex-shrink-0 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 xl:block">
                    <div
                      className="absolute inset-0 opacity-50"
                      style={{
                        backgroundImage: wallpaperUrl ? `url(${wallpaperUrl})` : undefined,
                        backgroundSize: 'cover',
                      }}
                    />
                    <div className="relative ml-[14%] mt-[14%] h-full w-full origin-top-left scale-[0.4] transform">
                      <CanvasPreview
                        folderImage={icon.imageUrl}
                        iconName="Star"
                        iconType="lucide"
                        iconColor="#000000"
                        iconSize="md"
                        offsetX={icon.offsetX || 0}
                        offsetY={icon.offsetY || 0}
                        format={osFormat}
                        enableCors={false}
                      />
                    </div>
                    <div className="absolute bottom-2 right-2 font-mono text-[10px] text-white/50">
                      Preview
                    </div>
                  </div>
                </div>
              </NeumorphBox>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 border-t border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 font-bold text-gray-500 transition-colors hover:text-gray-700"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex transform items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            <>
              <Check size={20} />
              Save Version
            </>
          )}
        </button>
      </div>
    </NeumorphBox>
  );
}

function ImageIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}
