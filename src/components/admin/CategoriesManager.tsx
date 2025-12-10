'use client';

import { useState } from 'react';
import { DB, Category } from '@/lib/types';
import { Plus, Trash2, Edit2, Save, X, Upload } from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '@/components/ui/Toast';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { EmptyState } from '@/components/admin/EmptyState';
import { ImageUploader } from './ImageUploader';
import { authenticatedFetch } from '@/lib/fetch-auth';

export function CategoriesManager({ initialData }: { initialData: DB }) {
  const [categories, setCategories] = useState<Category[]>(initialData.categories || []);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();
  const hasItems = categories.length > 0;

  const handleSave = async (category: Category) => {
    try {
      const response = await authenticatedFetch('/api/admin/categories', {
        method: isCreating ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });

      if (!response.ok) throw new Error('Failed to save category');

      const savedCategory = await response.json();

      if (isCreating) {
        setCategories([...categories, savedCategory]);
      } else {
        setCategories(categories.map((c) => (c.id === savedCategory.id ? savedCategory : c)));
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
      const response = await authenticatedFetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');

      setCategories(categories.filter((c) => c.id !== id));
      showToast('Category deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  // handleImageUpload removed - now using ImageUploader component directly

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
      {hasItems && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Categories</h2>
          <button
            onClick={startCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      )}

      {!hasItems && !isCreating && (
        <EmptyState
          title="No Categories Found"
          description="Create categories to organize your icons efficiently."
          actionLabel="Add Category"
          onAction={startCreate}
        />
      )}

      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isCreating ? 'New Category' : 'Edit Category'}
              </h3>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCreating(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Color
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      'bg-red-500',
                      'bg-orange-500',
                      'bg-amber-500',
                      'bg-yellow-500',
                      'bg-lime-500',
                      'bg-green-500',
                      'bg-emerald-500',
                      'bg-teal-500',
                      'bg-cyan-500',
                      'bg-sky-500',
                      'bg-blue-500',
                      'bg-indigo-500',
                      'bg-violet-500',
                      'bg-purple-500',
                      'bg-fuchsia-500',
                      'bg-pink-500',
                      'bg-rose-500',
                      'bg-slate-500',
                      'bg-gray-500',
                      'bg-zinc-500',
                    ].map((colorClass) => (
                      <button
                        key={colorClass}
                        onClick={() =>
                          setEditingCategory({ ...editingCategory, color: colorClass })
                        }
                        className={clsx(
                          'aspect-square w-full rounded-xl shadow-sm transition-all',
                          colorClass,
                          editingCategory.color === colorClass
                            ? 'z-10 scale-110 ring-4 ring-blue-500/50'
                            : 'hover:scale-105 hover:shadow-md'
                        )}
                        title={colorClass}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  className="h-24 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category Image
                </label>
                <ImageUploader
                  value={editingCategory.imageUrl}
                  onChange={(url) => setEditingCategory({ ...editingCategory, imageUrl: url })}
                  folder="categories"
                  aspectRatio="square"
                />
              </div>

              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <h4 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                  SEO Settings
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={editingCategory.seoTitle || ''}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, seoTitle: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      SEO Description
                    </label>
                    <textarea
                      value={editingCategory.seoDescription || ''}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, seoDescription: e.target.value })
                      }
                      className="h-20 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={editingCategory.seoKeywords?.join(', ') || ''}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          seoKeywords: e.target.value.split(',').map((k) => k.trim()),
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCreating(false);
                  }}
                  className="rounded-xl px-6 py-2 font-bold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingCategory)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700"
                >
                  <Save size={18} />
                  Save Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasItems && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <NeumorphBox
              key={category.id}
              className="group relative rounded-3xl p-6"
              showActions
              onEdit={() => setEditingCategory(category)}
              onDelete={() => handleDelete(category.id)}
            >
              <div
                className={`absolute -top-6 right-6 h-16 w-16 rounded-2xl ${category.color} flex items-center justify-center shadow-lg`}
              >
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-xl font-bold text-white">{category.name[0]}</span>
                )}
              </div>

              <h3 className="mb-2 mt-4 text-xl font-bold text-gray-800 dark:text-white">
                {category.name}
              </h3>
              <p className="mb-4 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                {category.description}
              </p>
            </NeumorphBox>
          ))}
        </div>
      )}
    </div>
  );
}
