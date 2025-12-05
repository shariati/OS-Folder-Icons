'use client';

import { useState, useMemo } from 'react';
import { DB, Bundle, OperatingSystem } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Trash2, Plus, Upload, Search, X, Edit2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from './Toast';
import { clsx } from 'clsx';

export function BundlesManager({ initialData }: { initialData: DB }) {
  const router = useRouter();
  const { showToast } = useToast();
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
    return Object.keys(LucideIcons).filter(key => key !== 'icons' && key !== 'createLucideIcon' && isNaN(Number(key)));
  }, []);
  const filteredIcons = useMemo(() => {
    if (!iconSearch) return iconNames.slice(0, 50);
    return iconNames.filter(name => name.toLowerCase().includes(iconSearch.toLowerCase())).slice(0, 50);
  }, [iconNames, iconSearch]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
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
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        targetOS,
        icons: selectedIcons.map(icon => ({ name: icon, type: 'lucide' })),
        previewImage: imageUrl
      };

      let res;
      if (editingBundleId) {
        res = await fetch(`/api/bundles/${editingBundleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...bundleData, id: editingBundleId })
        });
      } else {
        res = await fetch('/api/bundles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bundleData)
        });
      }

      if (res.ok) {
        setIsCreating(false);
        setEditingBundleId(null);
        resetForm();
        showToast(editingBundleId ? 'Bundle updated successfully' : 'Bundle created successfully', 'success');
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
    setSelectedIcons(bundle.icons.map(i => i.name));
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
      setSelectedIcons(selectedIcons.filter(i => i !== iconName));
    } else {
      setSelectedIcons([...selectedIcons, iconName]);
    }
  };

  const toggleOS = (osId: string) => {
    if (targetOS.includes(osId)) {
      setTargetOS(targetOS.filter(id => id !== osId));
    } else {
      setTargetOS([...targetOS, osId]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Bundles</h2>
        {!isCreating && (
          <button 
            onClick={() => { resetForm(); setIsCreating(true); }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
          >
            <Plus size={20} /> New Bundle
          </button>
        )}
      </div>

      {isCreating && (
        <div className="neu-flat p-8 rounded-3xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{editingBundleId ? 'Edit Bundle' : 'Create New Bundle'}</h3>
            <button onClick={() => { setIsCreating(false); resetForm(); }} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent min-h-[120px]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {initialData.tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          const currentTags = tags.split(',').map(t => t.trim()).filter(Boolean);
                          if (currentTags.includes(tag.slug)) {
                            setTags(currentTags.filter(t => t !== tag.slug).join(', '));
                          } else {
                            setTags([...currentTags, tag.slug].join(', '));
                          }
                        }}
                        className={clsx(
                          "px-3 py-1 rounded-lg text-xs font-bold transition-all border",
                          tags.split(',').map(t => t.trim()).includes(tag.slug)
                            ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                            : "bg-transparent border-gray-300 dark:border-gray-600 text-gray-500 hover:border-gray-400"
                        )}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                  <input 
                    value={tags} 
                    onChange={e => setTags(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent" 
                    placeholder="finance, productivity (comma separated)" 
                  />
                  <p className="text-xs text-gray-400 mt-2">Select from existing tags or type new ones.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Preview Image</label>
                  {existingPreviewUrl && !previewImage && (
                    <div className="mb-4 relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <Image src={existingPreviewUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    onChange={e => setPreviewImage(e.target.files?.[0] || null)} 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Target Operating Systems</label>
                  <div className="flex flex-wrap gap-3">
                    {initialData.operatingSystems.map(os => (
                      <button
                        key={os.id}
                        type="button"
                        onClick={() => toggleOS(os.id)}
                        className={clsx(
                          "px-4 py-2 rounded-xl text-sm font-bold transition-all border-2",
                          targetOS.includes(os.id) 
                            ? "bg-blue-50 border-blue-500 text-blue-600 shadow-sm" 
                            : "bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        {os.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Select Icons ({selectedIcons.length})</label>
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      value={iconSearch} 
                      onChange={e => setIconSearch(e.target.value)} 
                      className="w-full pl-10 pr-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent text-sm" 
                      placeholder="Search icons..." 
                    />
                  </div>
                  <div className="h-64 overflow-y-auto grid grid-cols-6 sm:grid-cols-8 gap-2 p-4 rounded-xl neu-pressed bg-gray-50/50 dark:bg-gray-900/50">
                    {filteredIcons.map(iconName => {
                      const Icon = (LucideIcons as any)[iconName];
                      if (!Icon) return null;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => toggleIcon(iconName)}
                          className={clsx(
                            "p-3 rounded-xl flex items-center justify-center transition-all aspect-square",
                            selectedIcons.includes(iconName) 
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105" 
                              : "text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
                          )}
                          title={iconName}
                        >
                          <Icon size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button 
                type="submit" 
                disabled={uploading}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
              >
                {uploading ? 'Saving...' : (editingBundleId ? 'Update Bundle' : 'Create Bundle')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialData.bundles.map(bundle => (
          <div key={bundle.id} className="neu-flat rounded-3xl overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-xl">
            {bundle.previewImage ? (
              <div className="relative h-56 w-full bg-gray-100 dark:bg-gray-800">
                <Image src={bundle.previewImage} alt={bundle.name} fill className="object-cover" />
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => startEdit(bundle)} className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg text-gray-600 hover:text-blue-600 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(bundle.id)} className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg text-gray-600 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-56 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 relative font-medium">
                No Preview
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => startEdit(bundle)} className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg text-gray-600 hover:text-blue-600 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(bundle.id)} className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg text-gray-600 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-xl text-gray-800 dark:text-white">{bundle.name}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{bundle.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {bundle.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg uppercase tracking-wide">#{tag}</span>
                ))}
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-gray-100 dark:border-gray-700 pt-4">
                <span>{bundle.icons.length} Icons</span>
                <span>{bundle.targetOS.length} OSs</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
