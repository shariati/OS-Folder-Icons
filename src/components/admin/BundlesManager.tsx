'use client';

import { useState, useMemo } from 'react';
import { DB, Bundle, OperatingSystem } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Trash2, Plus, Upload, Search, X, Edit2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { clsx } from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { EmptyState } from '@/components/admin/EmptyState';
import { uploadToFirebase } from '@/lib/client-upload';

export function BundlesManager({ initialData }: { initialData: DB }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [targetOS, setTargetOS] = useState<string[]>([]);
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [existingPreviewUrl, setExistingPreviewUrl] = useState('');

  // Icon Search
  const [iconSearch, setIconSearch] = useState('');
  const iconNames = useMemo(() => {
    return Object.keys(LucideIcons).filter(
      (key) => key !== 'icons' && key !== 'createLucideIcon' && isNaN(Number(key))
    );
  }, []);
  const filteredIcons = useMemo(() => {
    if (!iconSearch) return iconNames.slice(0, 50);
    return iconNames
      .filter((name) => name.toLowerCase().includes(iconSearch.toLowerCase()))
      .slice(0, 50);
  }, [iconNames, iconSearch]);

  const uploadFile = async (file: File) => {
    return uploadToFirebase(file, user);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setUploading(true);
    try {
      let imageUrl = existingPreviewUrl;
      if (previewImage) {
        imageUrl = await uploadFile(previewImage);
      }

      const bundleData: Partial<Bundle> = {
        name,
        description,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        targetOS,
        icons: selectedIcons.map((icon) => ({ name: icon, type: 'lucide' })),
        previewImage: imageUrl,
      };

      let res;
      if (editingBundleId) {
        res = await fetch(`/api/bundles/${editingBundleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...bundleData, id: editingBundleId }),
        });
      } else {
        res = await fetch('/api/bundles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bundleData),
        });
      }

      if (res.ok) {
        setIsCreating(false);
        setEditingBundleId(null);
        resetForm();
        showToast(
          editingBundleId ? 'Bundle updated successfully' : 'Bundle created successfully',
          'success'
        );
        router.refresh();
      } else {
        throw new Error('Failed to save bundle');
      }
    } catch (error) {
      showToast('Failed to save bundle', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return;
    try {
      const res = await fetch(`/api/bundles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Bundle deleted successfully', 'success');
        router.refresh();
      } else {
        throw new Error('Failed to delete bundle');
      }
    } catch (error) {
      showToast('Failed to delete bundle', 'error');
    }
  };

  const startEdit = (bundle: Bundle) => {
    setEditingBundleId(bundle.id);
    setName(bundle.name);
    setDescription(bundle.description);
    setTags(bundle.tags.join(', '));
    setTargetOS(bundle.targetOS);
    setSelectedIcons(bundle.icons.map((i) => i.name));
    setExistingPreviewUrl(bundle.previewImage || '');
    setPreviewImage(null);
    setIsCreating(true);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setTags('');
    setTargetOS([]);
    setSelectedIcons([]);
    setPreviewImage(null);
    setExistingPreviewUrl('');
    setEditingBundleId(null);
  };

  const toggleIcon = (iconName: string) => {
    if (selectedIcons.includes(iconName)) {
      setSelectedIcons(selectedIcons.filter((i) => i !== iconName));
    } else {
      setSelectedIcons([...selectedIcons, iconName]);
    }
  };

  const toggleOS = (osId: string) => {
    if (targetOS.includes(osId)) {
      setTargetOS(targetOS.filter((id) => id !== osId));
    } else {
      setTargetOS([...targetOS, osId]);
    }
  };

  const hasItems = initialData.bundles.length > 0;

  return (
    <div className="space-y-8">
      {hasItems && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Bundles</h2>
          {!isCreating && (
            <button
              onClick={() => {
                resetForm();
                setIsCreating(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:bg-blue-700"
            >
              <Plus size={20} /> New Bundle
            </button>
          )}
        </div>
      )}

      {!hasItems && !isCreating && (
        <EmptyState
          title="No Bundles Found"
          description="Create bundles to group icons for specific needs or themes."
          actionLabel="Create New Bundle"
          onAction={() => {
            resetForm();
            setIsCreating(true);
          }}
        />
      )}

      {isCreating && (
        <NeumorphBox
          className="animate-in fade-in slide-in-from-top-4"
          title={editingBundleId ? 'Edit Bundle' : 'Create New Bundle'}
          badge={
            <button
              onClick={() => {
                setIsCreating(false);
                resetForm();
              }}
              className="text-gray-400 transition-colors hover:text-red-500"
            >
              <X size={24} />
            </button>
          }
        >
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <NeumorphBox
                    as="input"
                    variant="pressed"
                    value={name}
                    onChange={(e: any) => setName(e.target.value)}
                    className="w-full rounded-xl bg-transparent px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <NeumorphBox
                    as="textarea"
                    variant="pressed"
                    value={description}
                    onChange={(e: any) => setDescription(e.target.value)}
                    className="min-h-[120px] w-full rounded-xl bg-transparent px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Tags
                  </label>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {initialData.tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          const currentTags = tags
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean);
                          if (currentTags.includes(tag.slug)) {
                            setTags(currentTags.filter((t) => t !== tag.slug).join(', '));
                          } else {
                            setTags([...currentTags, tag.slug].join(', '));
                          }
                        }}
                        className={clsx(
                          'rounded-lg border px-3 py-1 text-xs font-bold transition-all',
                          tags
                            .split(',')
                            .map((t) => t.trim())
                            .includes(tag.slug)
                            ? 'border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/20'
                            : 'border-gray-300 bg-transparent text-gray-500 hover:border-gray-400 dark:border-gray-600'
                        )}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                  <NeumorphBox
                    as="input"
                    variant="pressed"
                    value={tags}
                    onChange={(e: any) => setTags(e.target.value)}
                    className="w-full rounded-xl bg-transparent px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                    placeholder="finance, productivity (comma separated)"
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Select from existing tags or type new ones.
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Preview Image
                  </label>
                  {existingPreviewUrl && !previewImage && (
                    <div className="relative mb-4 h-48 w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                      <Image src={existingPreviewUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={(e) => setPreviewImage(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Target Operating Systems
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {initialData.operatingSystems.map((os) => (
                      <button
                        key={os.id}
                        type="button"
                        onClick={() => toggleOS(os.id)}
                        className={clsx(
                          'rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all',
                          targetOS.includes(os.id)
                            ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                            : 'border-gray-200 bg-transparent text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        )}
                      >
                        {os.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Select Icons ({selectedIcons.length})
                  </label>
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <NeumorphBox
                      as="input"
                      variant="pressed"
                      value={iconSearch}
                      onChange={(e: any) => setIconSearch(e.target.value)}
                      className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                      placeholder="Search icons..."
                    />
                  </div>
                  <NeumorphBox
                    variant="pressed"
                    className="grid h-64 grid-cols-6 gap-2 overflow-y-auto rounded-xl bg-gray-50/50 p-4 sm:grid-cols-8 dark:bg-gray-900/50"
                  >
                    {filteredIcons.map((iconName) => {
                      const Icon = (LucideIcons as any)[iconName];
                      if (!Icon) return null;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => toggleIcon(iconName)}
                          className={clsx(
                            'flex aspect-square items-center justify-center rounded-xl p-3 transition-all',
                            selectedIcons.includes(iconName)
                              ? 'scale-105 bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
                          )}
                          title={iconName}
                        >
                          <Icon size={20} />
                        </button>
                      );
                    })}
                  </NeumorphBox>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="submit"
                disabled={uploading}
                className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Saving...' : editingBundleId ? 'Update Bundle' : 'Create Bundle'}
              </button>
            </div>
          </form>
        </NeumorphBox>
      )}

      {hasItems && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {initialData.bundles.map((bundle) => (
            <NeumorphBox
              key={bundle.id}
              className="group overflow-hidden rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl"
              showActions
              onEdit={() => startEdit(bundle)}
              onDelete={() => handleDelete(bundle.id)}
            >
              {bundle.previewImage ? (
                <div className="relative -mx-8 -mt-8 mb-6 h-56 w-[calc(100%+4rem)] w-full bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={bundle.previewImage}
                    alt={bundle.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="relative -mx-8 -mt-8 mb-6 flex h-56 w-[calc(100%+4rem)] w-full items-center justify-center bg-gray-100 font-medium text-gray-400 dark:bg-gray-800">
                  No Preview
                </div>
              )}
              <div>
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{bundle.name}</h3>
                </div>
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {bundle.description}
                </p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {bundle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-600 dark:bg-gray-700/50 dark:text-gray-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-gray-700">
                  <span>{bundle.icons.length} Icons</span>
                  <span>{bundle.targetOS.length} OSs</span>
                </div>
              </div>
            </NeumorphBox>
          ))}
        </div>
      )}
    </div>
  );
}
