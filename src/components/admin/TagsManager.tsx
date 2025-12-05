'use client';

import { useState } from 'react';
import { DB, Tag } from '@/lib/types';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { v4 as uuidv4 } from 'uuid';
import { NeumorphBox } from '@/components/ui/NeumorphBox';

export function TagsManager({ initialData }: { initialData: DB }) {
  const [tags, setTags] = useState<Tag[]>(initialData.tags || []);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();

  const handleSave = async (tag: Tag) => {
    try {
      const response = await fetch('/api/admin/tags', {
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
      const response = await fetch(`/api/admin/tags?id=${id}`, {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tags</h2>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-blue-500/30"
        >
          <Plus size={18} />
          Add Tag
        </button>
      </div>

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
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setEditingTag({ ...editingTag, name, slug });
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                <input
                  type="text"
                  value={editingTag.slug}
                  onChange={e => setEditingTag({ ...editingTag, slug: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tags.map(tag => (
          <NeumorphBox 
            key={tag.id} 
            className="p-4 rounded-2xl flex flex-col justify-between group"
            title={tag.name}
            subtitle={<span className="text-xs font-mono">{tag.slug}</span>}
          >
            
            <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditingTag(tag)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(tag.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </NeumorphBox>
        ))}
      </div>
    </div>
  );
}
