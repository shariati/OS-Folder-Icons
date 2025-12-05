'use client';

import { useState } from 'react';
import { DB, OperatingSystem, OSVersion, FolderIcon } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Trash2, Plus, Upload, ChevronDown, ChevronRight, Edit2, X, Check } from 'lucide-react';
import { CanvasPreview } from '@/components/ui/CanvasPreview';
import { useToast } from '@/components/ui/Toast';
import { clsx } from 'clsx';
import { OS_FORMATS, BRAND_ICONS, OS_KEYWORD_MATCHERS } from '@/constants/os';

export function OSManager({ initialData }: { initialData: DB }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingOS, setIsAddingOS] = useState(false);
  
  // New OS State
  const [newOSName, setNewOSName] = useState('');
  const [newOSFormat, setNewOSFormat] = useState<'png' | 'ico' | 'icns'>('png');
  const [newOSBrandIcon, setNewOSBrandIcon] = useState('');
  const [newOSImage, setNewOSImage] = useState<File | null>(null);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  };

  const handleAddOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOSName) return;
    setIsUploading(true);
    try {
      let imageUrl = '';
      if (newOSImage) {
        imageUrl = await uploadFile(newOSImage);
      }

      const res = await fetch('/api/os', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newOSName, 
          image: imageUrl, 
          format: newOSFormat,
          brandIcon: newOSBrandIcon 
        })
      });

      if (res.ok) {
        setNewOSName('');
        setNewOSImage(null);
        setNewOSFormat('png');
        setNewOSBrandIcon('');
        setIsAddingOS(false);
        showToast('Operating System added successfully', 'success');
        router.refresh();
      } else {
        throw new Error('Failed to add OS');
      }
    } catch (error) {
      showToast('Failed to add OS', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteOS = async (id: string) => {
    if (!confirm('Are you sure you want to delete this OS? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/os/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Operating System deleted successfully', 'success');
        router.refresh();
      } else {
        throw new Error('Failed to delete OS');
      }
    } catch (error) {
      showToast('Failed to delete OS', 'error');
    }
  };

  const updateOS = async (os: OperatingSystem) => {
    try {
      const res = await fetch(`/api/os/${os.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(os)
      });
      if (res.ok) {
        router.refresh();
        return true;
      }
      throw new Error('Failed to update OS');
    } catch (error) {
      showToast('Failed to update OS', 'error');
      return false;
    }
  };

  return (
    <div className="space-y-8">
      {/* Add OS Button */}
      {!isAddingOS && (
        <button
          onClick={() => setIsAddingOS(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/10"
        >
          <Plus size={24} />
          Add New Operating System
        </button>
      )}

      {/* Add OS Form */}
      {isAddingOS && (
        <div className="neu-flat p-8 rounded-3xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Operating System</h2>
            <button onClick={() => setIsAddingOS(false)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleAddOS} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newOSName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewOSName(name);
                    if (OS_KEYWORD_MATCHERS.ICNS.some(k => name.toLowerCase().includes()k)) {
                      setNewOSFormat(OS_FORMATS.ICNS);
                    } else if (OS_KEYWORD_MATCHERS.ICO.some(k => name.toLowerCase().includes(k))) {
                      setNewOSFormat(OS_FORMATS.ICO);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent"
                  placeholder="e.g. Ubuntu"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Format</label>
                <div className="relative">
                  <select
                    value={newOSFormat}
                    onChange={(e) => setNewOSFormat(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent appearance-none"
                  >
                    <option value={OS_FORMATS.PNG}>PNG</option>
                    <option value={OS_FORMATS.ICO}>ICO</option>
                    <option value={OS_FORMATS.ICNS}>ICNS</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Brand Icon</label>
                <div className="flex gap-3">
                  {BRAND_ICONS.map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => setNewOSBrandIcon(icon.class)}
                      className={clsx(
                        "flex-1 py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                        newOSBrandIcon === icon.class
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500"
                      )}
                    >
                      <i className={clsx(icon.class, "text-2xl")} />
                      <span className="text-xs font-bold">{icon.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Icon (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setNewOSImage(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isUploading}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
              >
                {isUploading ? 'Adding...' : 'Add OS'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OS List */}
      <div className="space-y-6">
        {initialData.operatingSystems.map((os) => (
          <OSItem key={os.id} os={os} onUpdate={updateOS} onDelete={() => handleDeleteOS(os.id)} />
        ))}
      </div>
    </div>
  );
}

function OSItem({ os, onUpdate, onDelete }: { os: OperatingSystem, onUpdate: (os: OperatingSystem) => Promise<boolean>, onDelete: () => void }) {
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit State
  const [editName, setEditName] = useState(os.name);
  const [editFormat, setEditFormat] = useState(os.format || 'png');
  const [editBrandIcon, setEditBrandIcon] = useState(os.brandIcon || '');

  const handleSave = async () => {
    const success = await onUpdate({ 
      ...os, 
      name: editName, 
      format: editFormat, 
      brandIcon: editBrandIcon 
    });
    if (success) {
      setIsEditing(false);
      showToast('OS updated successfully', 'success');
    }
  };

  const addVersion = async () => {
    const name = prompt('Version Name (e.g. "11" or "Sequoia"):');
    if (!name) return;
    const newVersion: OSVersion = { id: uuidv4(), name, folderIcons: [] };
    const success = await onUpdate({ ...os, versions: [...os.versions, newVersion] });
    if (success) showToast('Version added', 'success');
  };

  const deleteVersion = async (versionId: string) => {
    if (!confirm('Delete this version and all its icons?')) return;
    const updatedVersions = os.versions.filter(v => v.id !== versionId);
    const success = await onUpdate({ ...os, versions: updatedVersions });
    if (success) showToast('Version deleted', 'success');
  };

  const updateVersionName = async (versionId: string, newName: string) => {
    const updatedVersions = os.versions.map(v => v.id === versionId ? { ...v, name: newName } : v);
    const success = await onUpdate({ ...os, versions: updatedVersions });
    if (success) showToast('Version renamed', 'success');
  };

  const addFolder = async (versionId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      const newFolder: FolderIcon = {
        id: uuidv4(),
        name: file.name.split('.')[0],
        imageUrl: data.url
      };

      const updatedVersions = os.versions.map(v => {
        if (v.id === versionId) {
          return { ...v, folderIcons: [...v.folderIcons, newFolder] };
        }
        return v;
      });

      const success = await onUpdate({ ...os, versions: updatedVersions });
      if (success) showToast('Folder icon added', 'success');
    } catch (e) {
      showToast('Error uploading folder icon', 'error');
    }
  };

  const deleteFolder = async (versionId: string, folderId: string) => {
    if (!confirm('Delete this folder icon?')) return;
    const updatedVersions = os.versions.map(v => {
      if (v.id === versionId) {
        return { ...v, folderIcons: v.folderIcons.filter(f => f.id !== folderId) };
      }
      return v;
    });
    const success = await onUpdate({ ...os, versions: updatedVersions });
    if (success) showToast('Folder icon deleted', 'success');
  };

  const updateFolder = async (versionId: string, folderId: string, updates: Partial<FolderIcon>) => {
    const updatedVersions = os.versions.map(v => {
      if (v.id === versionId) {
        return {
          ...v,
          folderIcons: v.folderIcons.map(f => f.id === folderId ? { ...f, ...updates } : f)
        };
      }
      return v;
    });
    await onUpdate({ ...os, versions: updatedVersions });
  };

  if (isEditing) {
    return (
      <div className="neu-flat p-6 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Name</label>
            <input 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              className="w-full px-3 py-2 rounded-lg neu-pressed outline-none bg-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Format</label>
            <div className="relative">
              <select 
                value={editFormat} 
                onChange={(e) => setEditFormat(e.target.value as any)} 
                className="w-full px-3 py-2 rounded-lg neu-pressed outline-none bg-transparent appearance-none"
              >
                <option value={OS_FORMATS.PNG}>PNG</option>
                <option value={OS_FORMATS.ICO}>ICO</option>
                <option value={OS_FORMATS.ICNS}>ICNS</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3 h-3" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Brand Icon</label>
            <div className="flex gap-2">
              {BRAND_ICONS.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => setEditBrandIcon(icon.class)}
                  className={clsx(
                    "flex-1 py-2 px-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                    editBrandIcon === icon.class
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-200 hover:border-gray-300 text-gray-500"
                  )}
                  title={icon.name}
                >
                  <i className={clsx(icon.class, "text-lg")} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30">Save Changes</button>
        </div>
      </div>
    );
  }

  return (
    <div className="neu-flat rounded-3xl overflow-hidden transition-all duration-300">
      <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-6 flex-1">
          <div className={clsx("transition-transform duration-200 p-2 rounded-full neu-pressed", expanded && "rotate-90")}>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          {os.image ? (
            <Image src={os.image} alt={os.name} width={48} height={48} className="rounded-xl shadow-sm" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 font-bold text-xl">?</div>
          )}
          <div>
            <h3 className="font-bold text-xl flex items-center gap-3 text-gray-800 dark:text-white">
              {os.name}
              {os.brandIcon && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md font-mono">{os.brandIcon}</span>}
              <span className="text-[10px] border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-md text-gray-500 uppercase font-bold tracking-wider">{os.format || 'png'}</span>
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">{os.versions.length} versions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-3 text-gray-500 hover:text-blue-600 neu-flat hover:neu-pressed rounded-xl transition-all" title="Edit OS">
            <Edit2 size={18} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); addVersion(); }} className="p-3 text-gray-500 hover:text-green-600 neu-flat hover:neu-pressed rounded-xl transition-all" title="Add Version">
            <Plus size={18} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-3 text-gray-500 hover:text-red-600 neu-flat hover:neu-pressed rounded-xl transition-all" title="Delete OS">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-6 space-y-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/10">
          {os.versions.length === 0 && (
            <div className="text-center py-12 text-gray-500 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <p className="font-medium">No versions defined yet.</p>
              <button onClick={addVersion} className="text-blue-600 hover:underline mt-2 text-sm font-bold">Add your first version</button>
            </div>
          )}
          
          {os.versions.map(version => (
            <div key={version.id} className="neu-flat rounded-2xl overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-gray-800 dark:text-white text-lg">{version.name}</h4>
                  <button 
                    onClick={() => {
                      const newName = prompt('Rename version:', version.name);
                      if (newName && newName !== version.name) updateVersionName(version.id, newName);
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm border border-blue-100 dark:border-blue-900/30">
                    <Upload size={16} />
                    <span>Upload Folder</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) addFolder(version.id, e.target.files[0]);
                      }}
                    />
                  </label>
                  <button 
                    onClick={() => deleteVersion(version.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {version.folderIcons.length === 0 ? (
                   <p className="text-sm text-gray-400 italic text-center py-8">No folder icons uploaded for this version.</p>
                ) : (
                  <div className="space-y-6">
                    {version.folderIcons.map(folder => (
                      <div key={folder.id} className="neu-pressed rounded-2xl p-6 transition-all">
                        <div className="flex flex-col xl:flex-row items-start gap-8">
                          {/* Controls */}
                          <div className="w-full xl:w-72 flex-shrink-0 space-y-5">
                            <div className="aspect-square relative bg-gray-100 dark:bg-gray-800/50 rounded-2xl mb-2 p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                               <Image src={folder.imageUrl} alt={folder.name} width={128} height={128} className="object-contain max-h-full" />
                               <button 
                                 onClick={() => deleteFolder(version.id, folder.id)}
                                 className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                               >
                                 <Trash2 size={16} />
                               </button>
                            </div>
                            
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
                              <input 
                                value={folder.name}
                                onChange={(e) => updateFolder(version.id, folder.id, { name: e.target.value })}
                                className="w-full px-3 py-2 text-sm font-bold text-center bg-transparent focus:outline-none text-gray-700 dark:text-gray-200"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">Offset X</label>
                                <input 
                                  type="number" 
                                  value={folder.offsetX || 0} 
                                  onChange={(e) => updateFolder(version.id, folder.id, { offsetX: parseInt(e.target.value) || 0 })}
                                  className="w-full px-2 py-1.5 border-none rounded-lg text-sm font-medium bg-white dark:bg-gray-700 shadow-sm text-center"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">Offset Y</label>
                                <input 
                                  type="number" 
                                  value={folder.offsetY || 0} 
                                  onChange={(e) => updateFolder(version.id, folder.id, { offsetY: parseInt(e.target.value) || 0 })}
                                  className="w-full px-2 py-1.5 border-none rounded-lg text-sm font-medium bg-white dark:bg-gray-700 shadow-sm text-center"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Live Preview */}
                          <div className="flex-1 w-full">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 ml-1">Live Preview</h5>
                            <div className="glass-panel rounded-2xl checkerboard flex items-center justify-center p-12 h-[400px]">
                              <div className="relative transform scale-75 origin-center">
                                 <CanvasPreview
                                   folderImage={folder.imageUrl}
                                   iconName="Star"
                                   iconType="lucide"
                                   iconColor="#000000"
                                   iconSize="medium"
                                   offsetX={folder.offsetX}
                                   offsetY={folder.offsetY}
                                   format={os.format}
                                 />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
