'use client';

import { useState } from 'react';
import { DB, Category } from '@/lib/types';
import { Plus, Trash2, Edit2, Save, X, Upload } from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '@/components/ui/Toast';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

export function CategoriesManager({ initialData }: { initialData: DB }) {
  const [categories, setCategories] = useState<Category[]>(initialData.categories || []);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();

  const handleSave = async (category: Category) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: isCreating ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });

      if (!response.ok) throw new Error('Failed to save category');

      const savedCategory = await response.json();

      if (isCreating) {
        setCategories([...categories, savedCategory]);
      } else {
        setCategories(categories.map(c => c.id === savedCategory.id ? savedCategory : c));
      }

      setEditingCategory(null);
      setIsCreating(false);
      showToast('Category saved successfully', 'success');
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Failed to save category', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');

      setCategories(categories.filter(c => c.id !== id));
      showToast('Category deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: Category) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setEditingCategory({ ...category, imageUrl: data.url });
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Failed to upload image', 'error');
    }
  };

  const startCreate = () => {
    setEditingCategory({
      id: uuidv4(),
      name: '',
      description: '',
      imageUrl: '',
      color: 'bg-blue-500',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: [],
    });
    setIsCreating(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Categories</h2>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-blue-500/30"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isCreating ? 'New Category' : 'Edit Category'}
              </h3>
              <button onClick={() => { setEditingCategory(null); setIsCreating(false); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500',
                      'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
                      'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
                      'bg-pink-500', 'bg-rose-500', 'bg-slate-500', 'bg-gray-500', 'bg-zinc-500'
                    ].map(colorClass => (
                      <button
                        key={colorClass}
                        onClick={() => setEditingCategory({ ...editingCategory, color: colorClass })}
                        className={clsx(
                          "w-full aspect-square rounded-xl transition-all shadow-sm",
                          colorClass,
                          editingCategory.color === colorClass 
                            ? "ring-4 ring-blue-500/50 scale-110 z-10" 
                            : "hover:scale-105 hover:shadow-md"
                        )}
                        title={colorClass}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingCategory.description}
                  onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image (PNG Transparent)</label>
                <div className="flex items-center gap-4">
                  {editingCategory.imageUrl && (
                    <div className="relative w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                      <Image src={editingCategory.imageUrl} alt="Preview" width={60} height={60} className="object-contain" />
                    </div>
                  )}
                  <label className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex items-center gap-2 transition-colors">
                    <Upload size={18} />
                    <span>Upload Image</span>
                    <input type="file" className="hidden" accept="image/png" onChange={(e) => handleImageUpload(e, editingCategory)} />
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">SEO Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={editingCategory.seoTitle || ''}
                      onChange={e => setEditingCategory({ ...editingCategory, seoTitle: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Description</label>
                    <textarea
                      value={editingCategory.seoDescription || ''}
                      onChange={e => setEditingCategory({ ...editingCategory, seoDescription: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={editingCategory.seoKeywords?.join(', ') || ''}
                      onChange={e => setEditingCategory({ ...editingCategory, seoKeywords: e.target.value.split(',').map(k => k.trim()) })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => { setEditingCategory(null); setIsCreating(false); }}
                  className="px-6 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingCategory)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div key={category.id} className="neu-flat p-6 rounded-3xl relative group">
            <div className={`absolute -top-6 right-6 w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center shadow-lg`}>
                {category.imageUrl ? (
                    <Image src={category.imageUrl} alt={category.name} width={40} height={40} className="object-contain" />
                ) : (
                    <span className="text-white font-bold text-xl">{category.name[0]}</span>
                )}
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-4 mb-2">{category.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{category.description}</p>
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingCategory(category)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
