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
import { useAuth } from '@/contexts/AuthContext';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { OSForm } from './OSForm';
import { uploadToFirebase } from '@/lib/client-upload';

import { EmptyState } from '@/components/admin/EmptyState';

export function OSManager({ initialData }: { initialData: DB }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<OperatingSystem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close form handler
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingOS(null);
  };

  // Create or Update Handler
  const handleSaveOS = async (data: Partial<OperatingSystem>) => {
    setIsSubmitting(true);
    try {
      if (editingOS) {
        // Update existing
        const res = await fetch(`/api/os/${editingOS.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update OS');
        showToast('Operating System updated successfully', 'success');
      } else {
        // Create new
        const res = await fetch('/api/os', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create OS');
        showToast('Operating System created successfully', 'success');
      }
      
      router.refresh();
      closeForm();
    } catch (error) {
      console.error(error);
      showToast('Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
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

  // Helper to trigger edit from item
  const startEdit = (os: OperatingSystem) => {
    setEditingOS(os);
    setIsFormOpen(true);
  };

  const hasItems = initialData.operatingSystems.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      {!isFormOpen && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-2xl font-bold text-black dark:text-white">Operating Systems</h2>
            <button 
                onClick={() => setIsFormOpen(true)} 
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
            >
            <Plus size={20} /> Add Operating System
            </button>
        </div>
      )}

      {/* Form Overlay/Mode */}
      {isFormOpen && (
        <OSForm 
            title={editingOS ? 'Edit Operating System' : 'Add New Operating System'}
            initialData={editingOS || {}}
            onSubmit={handleSaveOS}
            onCancel={closeForm}
            isSubmitting={isSubmitting}
        />
      )}

      {/* Empty State */}
      {!hasItems && !isFormOpen && (
        <EmptyState 
            title="No Operating Systems Found"
            description="Get started by adding your first operating system."
            actionLabel="Add Operating System"
            onAction={() => setIsFormOpen(true)}
        />
      )}

      {/* OS List */}
      {!isFormOpen && hasItems && (
        <div className="space-y-6">
            {initialData.operatingSystems.map((os) => (
            <OSItem 
                key={os.id} 
                os={os} 
                onEdit={() => startEdit(os)} 
                onDelete={() => handleDeleteOS(os.id)} 
            />
            ))}
        </div>
      )}
    </div>
  );
}

// Updated OSItem to support prop-drilled updates and new structure
function OSItem({ os, onEdit, onDelete }: { os: OperatingSystem, onEdit: () => void, onDelete: () => void }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  // Allow direct updates for versions/folders inside the item context
  const onUpdate = async (updatedOS: OperatingSystem) => {
      try {
        const res = await fetch(`/api/os/${updatedOS.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedOS)
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Update failed:', errorData);
            showToast(errorData.error || 'Failed to update OS', 'error');
            return false;
        }

        router.refresh();
        return true;
      } catch (e) {
          console.error('Update OS error:', e);
          showToast('Network error while updating OS', 'error');
          return false;
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
  
  // Upload Default Folder Image for a Version
  const uploadDefaultFolder = async (versionId: string, file: File) => {
     try {
        const url = await uploadToFirebase(file, user);
        const updatedVersions = os.versions.map(v => {
            if (v.id === versionId) {
                return { ...v, defaultFolderUrl: url };
            }
            return v;
        });
        await onUpdate({ ...os, versions: updatedVersions });
        showToast('Default folder image updated', 'success');
     } catch (e) {
         showToast('Upload failed', 'error');
     }
  };

  const addFolder = async (versionId: string, file: File) => {
    try {
      if (!user) {
         showToast('You must be logged in to upload files', 'error');
         return;
      }
      
      const url = await uploadToFirebase(file, user);

      const newFolder: FolderIcon = {
        id: uuidv4(),
        name: file.name.split('.')[0],
        imageUrl: url,
        offsetX: os.versions.find(v => v.id === versionId)?.defaultOffsetX || 0,
        offsetY: os.versions.find(v => v.id === versionId)?.defaultOffsetY || 0
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

  return (
    <NeumorphBox 
      className="overflow-hidden transition-all duration-300"
      showActions
      onEdit={onEdit}
      onDelete={onDelete}
      customActions={
        <button 
          onClick={(e) => { e.stopPropagation(); addVersion(); }}
          className="text-green-500 hover:text-green-600 transition-colors p-1.5 hover:bg-green-50 rounded-lg"
          title="Add Version"
        >
          <Plus size={18} />
        </button>
      }
    >
      <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-6 flex-1">
          <NeumorphBox variant="pressed" className={clsx("transition-transform duration-200 p-2 rounded-full", expanded && "rotate-90")}>
            <ChevronRight size={20} className="text-gray-400" />
          </NeumorphBox>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
             {os.brandIcon ? <i className={os.brandIcon} /> : os.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-xl flex items-center gap-3 text-gray-800 dark:text-white">
              {os.name}
              {os.brandIcon && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md font-mono">{os.brandIcon}</span>}
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">{os.versions.length} versions</p>
          </div>
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
            <NeumorphBox key={version.id} className="rounded-2xl overflow-hidden">
              <div className="px-6 py-4 flex flex-col gap-4 border-b border-gray-200/50 dark:border-gray-700/50">
                  {/* Version Header */}
                  <div className="flex items-center justify-between">
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
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => deleteVersion(version.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Default Template Configuration */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-dotted border-gray-300 dark:border-gray-600">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                         {version.defaultFolderUrl ? (
                             <Image src={version.defaultFolderUrl} alt="Template" fill className="object-contain" />
                         ) : (
                             <span className="text-[10px] text-gray-400 text-center p-1">No Template</span>
                         )}
                    </div>
                    <div className="flex-1 space-y-3 w-full">
                        <div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Default Folder Template</p>
                            <p className="text-xs text-gray-500">Used as the base for all icons in this version (512x512 recommended).</p>
                        </div>
                        
                        <div className="flex gap-3">
                             <div>
                                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Def Offset X</label>
                                <input 
                                  type="number" 
                                  value={version.defaultOffsetX || 0} 
                                  onChange={(e) => {
                                      const updatedVersions = os.versions.map(v => v.id === version.id ? { ...v, defaultOffsetX: parseInt(e.target.value) || 0 } : v);
                                      onUpdate({ ...os, versions: updatedVersions });
                                  }}
                                  className="w-20 px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium bg-white dark:bg-gray-700 shadow-sm text-center"
                                />
                             </div>
                             <div>
                                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Def Offset Y</label>
                                <input 
                                  type="number" 
                                  value={version.defaultOffsetY || 0} 
                                  onChange={(e) => {
                                      const updatedVersions = os.versions.map(v => v.id === version.id ? { ...v, defaultOffsetY: parseInt(e.target.value) || 0 } : v);
                                      onUpdate({ ...os, versions: updatedVersions });
                                  }}
                                  className="w-20 px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium bg-white dark:bg-gray-700 shadow-sm text-center"
                                />
                             </div>
                        </div>
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-xs font-bold transition-colors whitespace-nowrap self-start sm:self-center">
                        Upload Template
                        <input type="file" className="hidden" onChange={(e) => {
                            if (e.target.files?.[0]) uploadDefaultFolder(version.id, e.target.files[0]);
                        }} />
                    </label>
                </div>
              </div>

               {/* Folder Icons Actions */}
               <div className="px-6 py-3 bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-end">
                    <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20">
                        <Upload size={16} />
                        <span>Add Icon Variant</span>
                        <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files?.[0]) addFolder(version.id, e.target.files[0]);
                        }}
                        />
                    </label>
               </div>
              
              <div className="p-6">
                {version.folderIcons.length === 0 ? (
                   <p className="text-sm text-gray-400 italic text-center py-4">No icon variants added yet.</p>
                ) : (
                  <div className="space-y-6">
                    {version.folderIcons.map(folder => (
                      <NeumorphBox key={folder.id} variant="pressed" className="rounded-2xl p-6 transition-all">
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
                      </NeumorphBox>
                    ))}
                  </div>
                )}
              </div>
            </NeumorphBox>
          ))}
        </div>
      )}
    </NeumorphBox>
  );
}
