'use client';

import { useState } from 'react';
import { DB, OperatingSystem, OSVersion, FolderIcon } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Trash2, Plus, Upload, ChevronDown, ChevronRight, Edit2, X, Check } from 'lucide-react';
import { CanvasPreview } from './CanvasPreview';
import { useToast } from './Toast';
import { clsx } from 'clsx';

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
    <div className="space-y-6">
      {/* Add OS Button */}
      {!isAddingOS && (
        <button
          onClick={() => setIsAddingOS(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add New Operating System
        </button>
      )}

      {/* Add OS Form */}
      {isAddingOS && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Operating System</h2>
            <button onClick={() => setIsAddingOS(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAddOS} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={newOSName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewOSName(name);
                    if (name.toLowerCase().includes('mac') || name.toLowerCase().includes('apple') || name.toLowerCase().includes('os x')) {
                      setNewOSFormat('icns');
                    } else if (name.toLowerCase().includes('windows') || name.toLowerCase().includes('win')) {
                      setNewOSFormat('ico');
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g. Ubuntu"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
                <select
                  value={newOSFormat}
                  onChange={(e) => setNewOSFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="png">PNG</option>
                  <option value="ico">ICO</option>
                  <option value="icns">ICNS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand Icon (FA Class)</label>
                <input
                  type="text"
                  value={newOSBrandIcon}
                  onChange={(e) => setNewOSBrandIcon(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g. fa-brands fa-apple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setNewOSImage(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? 'Adding...' : 'Add OS'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OS List */}
      <div className="space-y-4">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-blue-500 p-4 space-y-4 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Format</label>
            <select 
              value={editFormat} 
              onChange={(e) => setEditFormat(e.target.value as any)} 
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="png">PNG</option>
              <option value="ico">ICO</option>
              <option value="icns">ICNS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Brand Icon</label>
            <input 
              value={editBrandIcon} 
              onChange={(e) => setEditBrandIcon(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="fa-brands fa-apple"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-all hover:shadow-md">
      <div className="p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setExpanded(!expanded)}>
          <div className={clsx("transition-transform duration-200", expanded && "rotate-90")}>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          {os.image ? (
            <Image src={os.image} alt={os.name} width={40} height={40} className="rounded-full bg-white shadow-sm p-1" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">?</div>
          )}
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
              {os.name}
              {os.brandIcon && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono">{os.brandIcon}</span>}
              <span className="text-xs border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 rounded text-gray-500 uppercase font-medium">{os.format || 'png'}</span>
            </h3>
            <p className="text-sm text-gray-500">{os.versions.length} versions</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-lg transition-all" title="Edit OS">
            <Edit2 size={18} />
          </button>
          <button onClick={addVersion} className="p-2 text-gray-500 hover:bg-white hover:text-green-600 hover:shadow-sm rounded-lg transition-all" title="Add Version">
            <Plus size={18} />
          </button>
          <button onClick={onDelete} className="p-2 text-gray-500 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-lg transition-all" title="Delete OS">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 border-t border-gray-100 dark:border-gray-700">
          {os.versions.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-dashed border-gray-200">
              <p>No versions defined yet.</p>
              <button onClick={addVersion} className="text-blue-600 hover:underline mt-2 text-sm">Add your first version</button>
            </div>
          )}
          
          {os.versions.map(version => (
            <div key={version.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{version.name}</h4>
                  <button 
                    onClick={() => {
                      const newName = prompt('Rename version:', version.name);
                      if (newName && newName !== version.name) updateVersionName(version.id, newName);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600 rounded-lg text-sm flex items-center gap-2 transition-all shadow-sm">
                    <Upload size={14} />
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
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-800">
                {version.folderIcons.length === 0 ? (
                   <p className="text-sm text-gray-400 italic text-center py-4">No folder icons uploaded for this version.</p>
                ) : (
                  <div className="space-y-6">
                    {version.folderIcons.map(folder => (
                      <div key={folder.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                          {/* Controls */}
                          <div className="w-full md:w-64 flex-shrink-0 space-y-4">
                            <div className="aspect-square relative bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-2 p-4 border border-gray-100 dark:border-gray-700">
                               <Image src={folder.imageUrl} alt={folder.name} fill className="object-contain" />
                               <button 
                                 onClick={() => deleteFolder(version.id, folder.id)}
                                 className="absolute top-2 right-2 p-1.5 bg-white shadow-sm rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                 <Trash2 size={14} />
                               </button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input 
                                value={folder.name}
                                onChange={(e) => updateFolder(version.id, folder.id, { name: e.target.value })}
                                className="w-full px-2 py-1 text-sm font-medium text-center border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                              />
                              <button onClick={() => deleteFolder(version.id, folder.id)} className="text-gray-400 hover:text-red-500">
                                <Trash2 size={14} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Offset X</label>
                                <input 
                                  type="number" 
                                  value={folder.offsetX || 0} 
                                  onChange={(e) => updateFolder(version.id, folder.id, { offsetX: parseInt(e.target.value) || 0 })}
                                  className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Offset Y</label>
                                <input 
                                  type="number" 
                                  value={folder.offsetY || 0} 
                                  onChange={(e) => updateFolder(version.id, folder.id, { offsetY: parseInt(e.target.value) || 0 })}
                                  className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Live Preview */}
                          <div className="flex-1 w-full">
                            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Live Preview</h5>
                            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-xl checkerboard flex items-center justify-center p-8 h-[300px] border border-gray-200 dark:border-gray-700">
                              <div className="relative transform scale-50 origin-center">
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
