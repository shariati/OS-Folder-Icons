'use client';

import { clsx } from 'clsx';
import { ChevronRight, Edit2, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { EmptyState } from '@/components/admin/EmptyState';
import { VersionForm } from '@/components/admin/VersionForm';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeumorphButton } from '@/components/ui/NeumorphButton';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { DB, OperatingSystem, OSVersion } from '@/lib/types';

import { OSForm } from './OSForm';

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
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update OS');
        showToast('Operating System updated successfully', 'success');
      } else {
        // Create new
        const res = await fetch('/api/os', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
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
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h2 className="text-2xl font-bold text-black dark:text-white">Operating Systems</h2>
          <NeumorphButton
            onClick={() => setIsFormOpen(true)}
            variant="flat"
            className="bg-primary flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium text-white hover:bg-opacity-90"
            icon={<Plus size={20} />}
            label="Add Operating System"
          />
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
function OSItem({
  os,
  onEdit,
  onDelete,
}: {
  os: OperatingSystem;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
        body: JSON.stringify(updatedOS),
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
        updatedVersions = currentVersions.map((v) =>
          v.id === editingVersion.id ? versionData : v
        );
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
    const updatedVersions = (os.versions || []).filter((v) => v.id !== versionId);
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
        <NeumorphButton
          onClick={openAddVersion}
          variant="flat"
          className="rounded-lg p-1.5 text-green-500 hover:bg-green-50 hover:text-green-600"
          title="Add Version"
          icon={<Plus size={18} />}
        />
      }
    >
      {/* Version Form (ADD MODE) - Inline at the top */}
      {isVersionFormOpen && !editingVersion && (
        <div className="border-t border-gray-200/50 bg-gray-50/30 p-6 dark:border-gray-700/50 dark:bg-gray-900/10">
          <VersionForm
            initialData={{}}
            osFormat={os.format}
            onSubmit={handleSaveVersion}
            onCancel={() => {
              setIsVersionFormOpen(false);
              setEditingVersion(null);
            }}
            isSubmitting={isSubmittingVersion}
          />
        </div>
      )}

      {/* OS Summary Row */}
      <div
        className="flex cursor-pointer items-center justify-between p-6 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-1 items-center gap-6">
          <NeumorphBox
            variant="pressed"
            className={clsx(
              'rounded-full p-2 transition-transform duration-200',
              expanded && 'rotate-90'
            )}
          >
            <ChevronRight size={20} className="text-gray-400" />
          </NeumorphBox>

          {/* OS Logo */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">
            {os.brandIcon ? <i className={os.brandIcon} /> : os.name.charAt(0)}
          </div>

          <div>
            <h3 className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-white">
              {os.name}
              {/* Format Badge */}
              <span className="rounded-md bg-gray-200 px-2 py-1 font-mono text-xs font-bold uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {os.format || 'PNG'}
              </span>
            </h3>
            <p className="mt-1 text-sm font-medium text-gray-500">
              {(os.versions || []).length} versions
            </p>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="space-y-6 border-t border-gray-200/50 bg-gray-50/30 p-6 dark:border-gray-700/50 dark:bg-gray-900/10">
          {(os.versions || []).length === 0 && !isVersionFormOpen && (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-500 dark:border-gray-700">
              <p className="font-medium">No versions defined yet.</p>
              <NeumorphButton
                onClick={openAddVersion}
                variant="flat"
                className="mt-2 bg-transparent text-sm font-bold text-blue-600 shadow-none hover:bg-transparent hover:underline"
                label="Add your first version"
              />
            </div>
          )}

          {/* Version List */}
          {(os.versions || []).map((version) => {
            // Check if we are editing THIS version
            if (editingVersion && editingVersion.id === version.id) {
              return (
                <VersionForm
                  key={`edit-${version.id}`}
                  initialData={version}
                  osFormat={os.format}
                  onSubmit={handleSaveVersion}
                  onCancel={() => {
                    setIsVersionFormOpen(false);
                    setEditingVersion(null);
                  }}
                  isSubmitting={isSubmittingVersion}
                />
              );
            }

            // Normal matching view
            return (
              <NeumorphBox
                key={version.id}
                variant="pressed"
                className="overflow-hidden rounded-2xl"
              >
                <div className="flex flex-col gap-4 px-6 py-4">
                  {/* Version Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                        {version.name}
                      </h4>
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800">
                        {version.folderIcons?.length || 0} variants
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <NeumorphButton
                        onClick={() => openEditVersion(version)}
                        variant="flat"
                        className="gap-1 rounded-xl p-2 text-sm font-bold text-blue-500 hover:bg-blue-50"
                        icon={<Edit2 size={16} />}
                        label="Edit Version"
                      />
                      <NeumorphButton
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteVersion(version.id);
                        }}
                        variant="flat"
                        className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        icon={<Trash2 size={18} />}
                      />
                    </div>
                  </div>

                  {/* Quick Grid Preview of Icons */}
                  <div className="flex flex-wrap gap-6 py-2">
                    {version.folderIcons?.map((icon) => (
                      <div
                        key={icon.id}
                        className="flex flex-col items-center gap-2"
                        title={icon.name}
                      >
                        <div className="relative h-12 w-12">
                          <Image
                            src={icon.imageUrl}
                            alt={icon.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        {icon.isDefault && (
                          <span className="text-[10px] font-bold uppercase text-gray-400">
                            Default Folder
                          </span>
                        )}
                      </div>
                    ))}
                    {(!version.folderIcons || version.folderIcons.length === 0) && (
                      <div className="w-full py-2 text-center text-sm italic text-gray-400">
                        No icons configured.
                      </div>
                    )}
                  </div>
                </div>
              </NeumorphBox>
            );
          })}
        </div>
      )}
    </NeumorphBox>
  );
}
