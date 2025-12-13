'use client';

import clsx from 'clsx';
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Plus,
  Save,
  Search,
  Tags as TagsIcon,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { EmptyState } from '@/components/admin/EmptyState';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { useToast } from '@/components/ui/Toast';
import { authenticatedFetch } from '@/lib/fetch-auth';
import { DB, Tag } from '@/lib/types';

import { normalizeTagName } from './TagAutocomplete';

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
      .filter(
        (tag) =>
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
        setTags(tags.map((t) => (t.id === savedTag.id ? savedTag : t)));
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

      setTags(tags.filter((t) => t.id !== id));
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

  return (
    <NeumorphBox className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white">
          <TagsIcon size={24} className="text-primary" />
          Tags Management
        </h3>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPageNum(1);
            }}
            className="focus:border-primary w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 outline-none transition dark:border-gray-700 dark:bg-gray-800"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Edit Modal */}
      {editingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isCreating ? 'New Tag' : 'Edit Tag'}
              </h3>
              <button
                onClick={() => {
                  setEditingTag(null);
                  setIsCreating(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={editingTag.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = normalizeTagName(name);
                    setEditingTag({ ...editingTag, name, slug });
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Web Development"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug (auto-generated)
                </label>
                <input
                  type="text"
                  value={editingTag.slug}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 font-mono text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Slug is automatically generated as lowercase kebab-case
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditingTag(null);
                    setIsCreating(false);
                  }}
                  className="rounded-xl px-6 py-2 font-bold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingTag)}
                  disabled={!editingTag.name.trim()}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:opacity-50"
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
          description={
            searchTerm ? 'Try adjusting your search.' : 'Create tags to categorize your content.'
          }
          actionLabel={!searchTerm ? 'Create Tag' : undefined}
          onAction={!searchTerm ? startCreate : undefined}
        />
      ) : (
        <>
          <div className="max-w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-left dark:bg-gray-800">
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Name
                  </th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {paginatedTags.map((tag) => (
                  <tr
                    key={tag.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-black dark:text-white">{tag.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        {tag.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingTag(tag)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
                Showing {(currentPageNum - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPageNum * ITEMS_PER_PAGE, filteredTags.length)} of{' '}
                {filteredTags.length} tags
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                  disabled={currentPageNum === 1}
                  className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPageNum(pageNum)}
                    className={clsx(
                      'h-10 w-10 rounded-lg font-medium transition-colors',
                      pageNum === currentPageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPageNum(Math.min(totalPages, currentPageNum + 1))}
                  disabled={currentPageNum === totalPages}
                  className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
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
