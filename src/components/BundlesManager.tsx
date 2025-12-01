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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bundles</h2>
        {!isCreating && (
          <button 
            onClick={() => { resetForm(); setIsCreating(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18} /> New Bundle
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-medium">{editingBundleId ? 'Edit Bundle' : 'Create New Bundle'}</h3>
            <button onClick={() => { setIsCreating(false); resetForm(); }}><X className="text-gray-500" /></button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input value={tags} onChange={e => setTags(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="productivity, dev, minimal" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preview Image</label>
                  {existingPreviewUrl && !previewImage && (
                    <div className="mb-2 relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image src={existingPreviewUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <input type="file" onChange={e => setPreviewImage(e.target.files?.[0] || null)} className="w-full text-sm" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Operating Systems</label>
                  <div className="flex flex-wrap gap-2">
                    {initialData.operatingSystems.map(os => (
                      <button
                        key={os.id}
                        type="button"
                        onClick={() => toggleOS(os.id)}
                        className={clsx(
                          "px-3 py-1 rounded-full text-sm border transition-colors",
                          targetOS.includes(os.id) ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-600"
                        )}
                      >
                        {os.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Icons ({selectedIcons.length})</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      value={iconSearch} 
                      onChange={e => setIconSearch(e.target.value)} 
                      className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-sm" 
                      placeholder="Search icons..." 
                    />
                  </div>
                  <div className="h-48 overflow-y-auto grid grid-cols-6 gap-2 p-2 border rounded-lg bg-gray-50">
                    {filteredIcons.map(iconName => {
                      const Icon = (LucideIcons as any)[iconName];
                      if (!Icon) return null;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => toggleIcon(iconName)}
                          className={clsx(
                            "p-2 rounded flex items-center justify-center hover:bg-white transition-colors",
                            selectedIcons.includes(iconName) ? "bg-blue-100 text-blue-600 ring-1 ring-blue-500" : "text-gray-500"
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

            <div className="flex justify-end pt-4 border-t">
              <button 
                type="submit" 
                disabled={uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Saving...' : (editingBundleId ? 'Update Bundle' : 'Create Bundle')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialData.bundles.map(bundle => (
          <div key={bundle.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            {bundle.previewImage ? (
              <div className="relative h-48 w-full bg-gray-100">
                <Image src={bundle.previewImage} alt={bundle.name} fill className="object-cover" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(bundle)} className="bg-white p-1.5 rounded-lg shadow text-gray-600 hover:text-blue-600">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(bundle.id)} className="bg-white p-1.5 rounded-lg shadow text-gray-600 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-48 w-full bg-gray-100 flex items-center justify-center text-gray-400 relative">
                No Preview
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(bundle)} className="bg-white p-1.5 rounded-lg shadow text-gray-600 hover:text-blue-600">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(bundle.id)} className="bg-white p-1.5 rounded-lg shadow text-gray-600 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{bundle.name}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{bundle.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {bundle.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">#{tag}</span>
                ))}
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
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
