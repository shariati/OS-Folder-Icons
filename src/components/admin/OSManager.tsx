'use client';

import { useState } from 'react';
import { DB, OperatingSystem, OSVersion, FolderIcon } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Trash2, Plus, Upload, ChevronDown, ChevronRight, Edit2, X, Check } from 'lucide-react';
import { CanvasPreview } from '@/components/ui/CanvasPreview';
import { useToast } from '@/components/ui/Toast';
import { InputModal } from '@/components/ui/InputModal';
import { clsx } from 'clsx';
import { OS_FORMATS, BRAND_ICONS, OS_KEYWORD_MATCHERS } from '@/constants/os';
import { useAuth } from '@/contexts/AuthContext';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { OSForm } from './OSForm';
import { VersionForm } from '@/components/admin/VersionForm';
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
  
  // New Version Form State
  const [isVersionFormOpen, setIsVersionFormOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<OSVersion | null>(null);
  const [isSubmittingVersion, setIsSubmittingVersion] = useState(false);

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

  const handleSaveVersion = async (versionData: OSVersion) => {
    setIsSubmittingVersion(true);
    try {
      const currentVersions = os.versions || [];
      let updatedVersions;
      
      if (editingVersion) {
        // Update existing
        updatedVersions = currentVersions.map(v => v.id === editingVersion.id ? versionData : v);
      } else {
        // Add new
        updatedVersions = [...currentVersions, versionData];
      }

      const success = await onUpdate({ ...os, versions: updatedVersions });
      if (success) {
        showToast(`Version ${editingVersion ? 'updated' : 'added'} successfully`, 'success');
        setIsVersionFormOpen(false);
        setEditingVersion(null);
      }
    } catch (e) {
      showToast('Failed to save version', 'error');
    } finally {
      setIsSubmittingVersion(false);
    }
  };

  const deleteVersion = async (versionId: string) => {
    if (!confirm('Delete this version and all its icons?')) return;
    const updatedVersions = (os.versions || []).filter(v => v.id !== versionId);
    const success = await onUpdate({ ...os, versions: updatedVersions });
    if (success) showToast('Version deleted', 'success');
  };

  const openAddVersion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVersion(null);
    setIsVersionFormOpen(true);
  };

  const openEditVersion = (version: OSVersion) => {
    setEditingVersion(version);
    setIsVersionFormOpen(true);
  };

  return (
    <NeumorphBox 
      className="overflow-hidden transition-all duration-300"
      showActions
      onEdit={onEdit}
      onDelete={onDelete}
      customActions={
        <button 
          onClick={openAddVersion}
          className="text-green-500 hover:text-green-600 transition-colors p-1.5 hover:bg-green-50 rounded-lg"
          title="Add Version"
        >
          <Plus size={18} />
        </button>
      }
    >
      {/* Version Form Overlay */}
      {isVersionFormOpen && (
        <VersionForm
          initialData={editingVersion || {}}
          osFormat={os.format}
          onSubmit={handleSaveVersion}
          onCancel={() => {
            setIsVersionFormOpen(false);
            setEditingVersion(null);
          }}
          isSubmitting={isSubmittingVersion}
        />
      )}
      
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
            <p className="text-sm text-gray-500 font-medium mt-1">{(os.versions || []).length} versions</p>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-6 space-y-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/10">
          {(os.versions || []).length === 0 && (
            <div className="text-center py-12 text-gray-500 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <p className="font-medium">No versions defined yet.</p>
              <button onClick={openAddVersion} className="text-blue-600 hover:underline mt-2 text-sm font-bold">Add your first version</button>
            </div>
          )}
          
          {/* Read-Only View of Versions (since editing is done in the modal now) */}
          {(os.versions || []).map(version => (
            <NeumorphBox key={version.id} variant="pressed" className="rounded-2xl overflow-hidden">
              <div className="px-6 py-4 flex flex-col gap-4">
                  {/* Version Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-3">
                        <h4 className="font-bold text-gray-800 dark:text-white text-lg">{version.name}</h4>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-500">
                          {version.folderIcons?.length || 0} variants
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => openEditVersion(version)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors font-bold text-sm flex items-center gap-1"
                        >
                            <Edit2 size={16} /> Edit Version
                        </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); deleteVersion(version.id); }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Quick Grid Preview of Icons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 py-2">
                   {version.folderIcons?.map(icon => (
                     <div key={icon.id} className="relative aspect-square rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center group">
                        <Image src={icon.imageUrl} alt={icon.name} width={64} height={64} className="object-contain" />
                        {icon.isDefault && (
                          <div className="absolute top-1 right-1 text-[10px] bg-amber-400 text-amber-900 px-1 rounded font-bold">★</div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity truncate px-1">
                          {icon.name}
                        </div>
                     </div>
                   ))}
                   {(!version.folderIcons || version.folderIcons.length === 0) && (
                     <div className="col-span-full text-center text-sm text-gray-400 italic py-2">
                       No icons configured.
                     </div>
                   )}
                </div>
              </div>
            </NeumorphBox>
          ))}
        </div>
      )}
    </NeumorphBox>
  );
}
