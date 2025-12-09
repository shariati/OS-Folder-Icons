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

export function VersionForm({ initialData, osFormat, onSubmit, onCancel, isSubmitting = false }: VersionFormProps) {
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
  const [pendingFolderFiles, setPendingFolderFiles] = useState<{ id: string, file: File }[]>([]);

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateImage = async (file: File, requiredSize?: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (requiredSize) {
          if (img.width !== requiredSize || img.height !== requiredSize) {
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
    const isValid = await validateImage(file, 1024);
    if (!isValid) {
      showToast('Default folder image must be exactly 1024x1024 pixels.', 'error');
      return;
    }
    setDefaultFolderFile(file);
    setDefaultFolderUrl(URL.createObjectURL(file));
  };

  const handleAddFolderIcon = async (file: File) => {
    const isValid = await validateImage(file, 1024);
    if (!isValid) {
      showToast('Folder icon must be exactly 1024x1024 pixels.', 'error');
      return;
    }

    const tempId = uuidv4();
    const previewUrl = URL.createObjectURL(file);
    
    // Add to pending files map
    setPendingFolderFiles(prev => [...prev, { id: tempId, file }]);
    
    // Add to UI list
    const newIcon: FolderIcon = {
      id: tempId,
      name: file.name.split('.')[0],
      imageUrl: previewUrl,
      offsetX: defaultOffsetX,
      offsetY: defaultOffsetY,
      isDefault: folderIcons.length === 0 // Make default if it's the first one
    };
    
    setFolderIcons(prev => [...prev, newIcon]);
  };

  const handleRemoveFolderIcon = (id: string) => {
    setFolderIcons(prev => prev.filter(icon => icon.id !== id));
    setPendingFolderFiles(prev => prev.filter(p => p.id !== id));
  };

  const handleSetDefaultIcon = (id: string) => {
    setFolderIcons(prev => prev.map(icon => ({
      ...icon,
      isDefault: icon.id === id
    })));
  };

  const updateFolderIcon = (id: string, updates: Partial<FolderIcon>) => {
    setFolderIcons(prev => prev.map(icon => icon.id === id ? { ...icon, ...updates } : icon));
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
      const finalFolderIcons = await Promise.all(folderIcons.map(async (icon) => {
        const pending = pendingFolderFiles.find(p => p.id === icon.id);
        if (pending) {
          const url = await uploadToFirebase(pending.file, user);
          return { ...icon, imageUrl: url };
        }
        return icon;
      }));

      // 3. Construct final object
      const versionData: OSVersion = {
        id: initialData?.id || uuidv4(),
        name,
        wallpaperUrl: finalWallpaperUrl,
        defaultFolderUrl: finalDefaultFolderUrl,
        defaultOffsetX,
        defaultOffsetY,
        folderIcons: finalFolderIcons,
        defaultFolderIconId: finalFolderIcons.find(f => f.isDefault)?.id
      };

      await onSubmit(versionData);

    } catch (error) {
      console.error('Submission failed', error);
      showToast('Failed to save version. Please try again.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <NeumorphBox variant="pressed" className="w-full max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {initialData?.id ? 'Edit Version' : 'Add New Version'}
            </h2>
            <p className="text-gray-500 text-sm">Configure version details, templates, and icon variants.</p>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Main Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Version Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
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
                    "w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 transition-all focus:outline-none",
                    errors.name 
                      ? "border-red-300 focus:border-red-500" 
                      : "border-transparent focus:border-blue-500"
                  )}
                  placeholder='e.g. "11" or "Sequoia"'
                />
                {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name}</p>}
              </div>

               {/* Default Template & Offsets */}
               <NeumorphBox variant="pressed" className="p-4 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 relative group">
                      {defaultFolderUrl ? (
                        <Image src={defaultFolderUrl} alt="Template" fill className="object-contain" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                           <Upload size={24} />
                           <span className="text-[10px] uppercase font-bold mt-1">1024px</span>
                        </div>
                      )}
                      
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-bold text-xs">
                         {defaultFolderUrl ? 'Change' : 'Upload'}
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                           if (e.target.files?.[0]) handleDefaultFolderUpload(e.target.files[0]);
                         }} />
                      </label>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                       <div>
                         <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200">Default Template</h4>
                         <p className="text-xs text-gray-500">Base image for all folders (1024x1024 req).</p>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500">Def Offset X</label>
                            <input 
                              type="number" 
                              value={defaultOffsetX}
                              onChange={(e) => setDefaultOffsetX(Number(e.target.value))}
                              className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500">Def Offset Y</label>
                            <input 
                              type="number" 
                              value={defaultOffsetY}
                              onChange={(e) => setDefaultOffsetY(Number(e.target.value))}
                              className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800"
                            />
                          </div>
                       </div>
                    </div>
                  </div>
               </NeumorphBox>
            </div>

            {/* Wallpaper Section */}
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Preview Wallpaper
               </label>
               <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 group border-2 border-dashed border-gray-300 dark:border-gray-600">
                  {wallpaperUrl ? (
                    <Image src={wallpaperUrl} alt="Wallpaper" fill className="object-cover" />
                  ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon size={48} className="mb-2 opacity-50" />
                        <span className="font-medium text-sm">Upload Desktop Wallpaper</span>
                     </div>
                  )}
                  
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-white font-bold border border-white/30 hover:bg-white/30 transition-colors">
                        {wallpaperUrl ? 'Change Wallpaper' : 'Upload Wallpaper'}
                      </span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          if (e.target.files?.[0]) handleWallpaperUpload(e.target.files[0]);
                      }} />
                  </label>
               </div>
               <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                 <Info size={12} />
                 Used for live preview background only.
               </p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Folder Icons Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                 <h3 className="text-lg font-bold text-gray-800 dark:text-white">Folder Icons</h3>
                 <p className="text-sm text-gray-500">Add variants for this version (e.g. Empty, Full, Open). All must be 1024x1024.</p>
              </div>
              <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20">
                 <Upload size={18} />
                 Add Icon Variant
                 <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    if (e.target.files?.[0]) handleAddFolderIcon(e.target.files[0]);
                 }} />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {folderIcons.length === 0 && (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl mb-4">
                  No icons added yet. Upload your first variant.
                </div>
              )}
              
              {folderIcons.map((icon, idx) => (
                <NeumorphBox key={icon.id} className="p-6 relative group overflow-hidden">
                   {/* "Default" Badge */}
                   {icon.isDefault && (
                     <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                       Default Icon
                     </div>
                   )}

                   <div className="flex flex-col lg:flex-row gap-8 items-start">
                      {/* Icon Preview & Basic Info */}
                      <div className="flex-shrink-0 w-32 flex flex-col gap-3">
                         <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-xl p-2 relative border border-gray-200 dark:border-gray-700">
                            <Image src={icon.imageUrl} alt={icon.name} fill className="object-contain p-2" />
                         </div>
                         <input 
                           type="text" 
                           value={icon.name}
                           onChange={(e) => updateFolderIcon(icon.id, { name: e.target.value })}
                           className="w-full text-center text-sm font-bold bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none py-1"
                         />
                      </div>

                      {/* Controls */}
                      <div className="flex-1 w-full space-y-6">
                         {/* Sliders */}
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div className="space-y-2">
                               <div className="flex justify-between">
                                  <label className="text-xs font-bold text-gray-500 uppercase">Offset X</label>
                                  <span className="text-xs font-mono">{icon.offsetX || 0}px</span>
                               </div>
                               <input 
                                 type="range" min="-200" max="200" 
                                 value={icon.offsetX || 0}
                                 onChange={(e) => updateFolderIcon(icon.id, { offsetX: Number(e.target.value) })}
                                 className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                               />
                            </div>
                            <div className="space-y-2">
                               <div className="flex justify-between">
                                  <label className="text-xs font-bold text-gray-500 uppercase">Offset Y</label>
                                  <span className="text-xs font-mono">{icon.offsetY || 0}px</span>
                               </div>
                               <input 
                                 type="range" min="-200" max="200" 
                                 value={icon.offsetY || 0}
                                 onChange={(e) => updateFolderIcon(icon.id, { offsetY: Number(e.target.value) })}
                                 className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                               />
                            </div>
                         </div>
                         
                         {/* Actions */}
                         <div className="flex items-center gap-4">
                            {!icon.isDefault && (
                              <button 
                                onClick={() => handleSetDefaultIcon(icon.id)}
                                type="button"
                                className="text-sm font-bold text-amber-600 hover:text-amber-700 hover:underline px-2"
                              >
                                Set as Default
                              </button>
                            )}
                            <button 
                              onClick={() => handleRemoveFolderIcon(icon.id)}
                              type="button"
                              className="text-sm font-bold text-red-500 hover:text-red-600 hover:underline px-2 ml-auto"
                            >
                              Remove Variant
                            </button>
                         </div>
                      </div>

                      {/* Live Canvas Preview (Mini) */}
                      <div className="w-48 h-48 bg-gray-900 rounded-xl overflow-hidden relative border border-gray-700 flex-shrink-0 hidden xl:block">
                         <div className="absolute inset-0 opacity-50" style={{ backgroundImage: wallpaperUrl ? `url(${wallpaperUrl})` : undefined, backgroundSize: 'cover' }} />
                         <div className="relative w-full h-full transform scale-[0.4] origin-top-left ml-[14%] mt-[14%]">
                            <CanvasPreview
                              folderImage={icon.imageUrl}
                              iconName="Star"
                              iconType="lucide"
                              iconColor="#000000"
                              iconSize="medium"
                              offsetX={icon.offsetX || 0}
                              offsetY={icon.offsetY || 0}
                              format={osFormat}
                            />
                         </div>
                         <div className="absolute bottom-2 right-2 text-[10px] text-white/50 font-mono">Preview</div>
                      </div>
                   </div>
                </NeumorphBox>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
    </div>
  );
}

function ImageIcon({ size, className }: { size: number, className?: string }) {
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
