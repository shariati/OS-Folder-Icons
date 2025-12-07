'use client';

import { useState, useMemo } from 'react';
import { DB, Tag } from '@/lib/types';
import { Plus, Search, Tags as TagsIcon, Edit2, Trash2, ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { v4 as uuidv4 } from 'uuid';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { EmptyState } from '@/components/admin/EmptyState';
import { normalizeTagName } from './TagAutocomplete';
import clsx from 'clsx';
import { authenticatedFetch } from '@/lib/fetch-auth';

interface TagsManagerProps {
  initialData: DB;
}

const ITEMS_PER_PAGE = 10;

export function TagsManager({ initialData }: TagsManagerProps) {
  const [tags, setTags] = useState<Tag[]>(initialData.tags || []);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const { showToast } = useToast();

  // Filter and sort tags
  const filteredTags = useMemo(() => {
    return tags
      .filter(tag => 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tags, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredTags.length / ITEMS_PER_PAGE);
  const paginatedTags = filteredTags.slice(
    (currentPageNum - 1) * ITEMS_PER_PAGE,
    currentPageNum * ITEMS_PER_PAGE
  );

  const handleSave = async (tag: Tag) => {
    // Ensure slug is normalized
    tag.slug = normalizeTagName(tag.name);
    
    try {
      const response = await authenticatedFetch('/api/admin/tags', {
        method: isCreating ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tag),
      });

      if (!response.ok) throw new Error('Failed to save tag');

      const savedTag = await response.json();

      if (isCreating) {
        setTags([...tags, savedTag]);
      } else {
        setTags(tags.map(t => t.id === savedTag.id ? savedTag : t));
      }

      setEditingTag(null);
      setIsCreating(false);
      showToast('Tag saved successfully', 'success');
    } catch (error) {
      console.error('Error saving tag:', error);
      showToast('Failed to save tag', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const response = await authenticatedFetch(`/api/admin/tags?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete tag');

      setTags(tags.filter(t => t.id !== id));
      showToast('Tag deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting tag:', error);
      showToast('Failed to delete tag', 'error');
    }
  };

  const startCreate = () => {
    setEditingTag({
      id: uuidv4(),
      name: '',
      slug: '',
    });
    setIsCreating(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <NeumorphBox className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h3 className="font-bold text-xl text-black dark:text-white flex items-center gap-2">
          <TagsIcon size={24} className="text-primary" />
          Tags Management
        </h3>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={18} />
          New Tag
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPageNum(1); }}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-800"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Edit Modal */}
      {editingTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isCreating ? 'New Tag' : 'Edit Tag'}
              </h3>
              <button onClick={() => { setEditingTag(null); setIsCreating(false); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editingTag.name}
                  onChange={e => {
                    const name = e.target.value;
                    const slug = normalizeTagName(name);
                    setEditingTag({ ...editingTag, name, slug });
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Web Development"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (auto-generated)</label>
                <input
                  type="text"
                  value={editingTag.slug}
                  readOnly
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Slug is automatically generated as lowercase kebab-case</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => { setEditingTag(null); setIsCreating(false); }}
                  className="px-6 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingTag)}
                  disabled={!editingTag.name.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  Save Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredTags.length === 0 ? (
        <EmptyState
          title="No tags found"
          description={searchTerm ? "Try adjusting your search." : "Create tags to categorize your content."}
          actionLabel={!searchTerm ? "Create Tag" : undefined}
          onAction={!searchTerm ? startCreate : undefined}
        />
      ) : (
        <>
          <div className="max-w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Name</th>
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Slug</th>
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {paginatedTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-black dark:text-white">{tag.name}</p>
                    </td>
                    <td className="py-4 px-6">
                      <code className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {tag.slug}
                      </code>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingTag(tag)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {((currentPageNum - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPageNum * ITEMS_PER_PAGE, filteredTags.length)} of {filteredTags.length} tags
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                  disabled={currentPageNum === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPageNum(pageNum)}
                    className={clsx(
                      "w-10 h-10 rounded-lg font-medium transition-colors",
                      pageNum === currentPageNum
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPageNum(Math.min(totalPages, currentPageNum + 1))}
                  disabled={currentPageNum === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </NeumorphBox>
  );
}
