'use client';

import { Plus, Save, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { EmptyState } from '@/components/admin/EmptyState';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { useToast } from '@/components/ui/Toast';
import { authenticatedFetch } from '@/lib/fetch-auth';
import { DB, HeroSlide } from '@/lib/types';

import { ImageUploader } from './ImageUploader';

export function HeroManager({ initialData }: { initialData: DB }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialData.heroSlides || []);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();
  const hasItems = slides.length > 0;

  const handleSave = async (slide: HeroSlide) => {
    try {
      const response = await authenticatedFetch('/api/admin/hero', {
        method: isCreating ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slide),
      });

      if (!response.ok) throw new Error('Failed to save slide');

      const savedSlide = await response.json();

      if (isCreating) {
        setSlides([...slides, savedSlide]);
      } else {
        setSlides(slides.map((s) => (s.id === savedSlide.id ? savedSlide : s)));
      }

      setEditingSlide(null);
      setIsCreating(false);
      showToast('Slide saved successfully', 'success');
    } catch (error) {
      console.error('Error saving slide:', error);
      showToast('Failed to save slide', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const response = await authenticatedFetch(`/api/admin/hero?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete slide');

      setSlides(slides.filter((s) => s.id !== id));
      showToast('Slide deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting slide:', error);
      showToast('Failed to delete slide', 'error');
    }
  };

  // handleImageUpload removed - now using ImageUploader component directly

  const startCreate = () => {
    setEditingSlide({
      id: uuidv4(),
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      link: '',
      order: slides.length + 1,
    });
    setIsCreating(true);
  };

  return (
    <div className="space-y-6">
      {hasItems && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Hero Slides</h2>
          <button
            onClick={startCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Slide
          </button>
        </div>
      )}

      {!hasItems && !isCreating && (
        <EmptyState
          title="No Hero Slides Found"
          description="Create slides to showcase important content on your homepage."
          actionLabel="Add Slide"
          onAction={startCreate}
        />
      )}

      {editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isCreating ? 'New Slide' : 'Edit Slide'}
              </h3>
              <button
                onClick={() => {
                  setEditingSlide(null);
                  setIsCreating(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={editingSlide.subtitle || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={editingSlide.description}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, description: e.target.value })
                  }
                  className="h-24 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Link (e.g. /bundles/gaming)
                </label>
                <input
                  type="text"
                  value={editingSlide.link || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, link: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Background Image
                </label>
                <ImageUploader
                  value={editingSlide.imageUrl}
                  onChange={(url) => setEditingSlide({ ...editingSlide, imageUrl: url })}
                  folder="hero"
                  aspectRatio="video"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditingSlide(null);
                    setIsCreating(false);
                  }}
                  className="rounded-xl px-6 py-2 font-bold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingSlide)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700"
                >
                  <Save size={18} />
                  Save Slide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasItems && (
        <div className="space-y-4">
          {slides
            .sort((a, b) => a.order - b.order)
            .map((slide, index) => (
              <NeumorphBox
                key={slide.id}
                className="group flex items-center gap-4 rounded-2xl p-4"
                showActions
                onEdit={() => setEditingSlide(slide)}
                onDelete={() => handleDelete(slide.id)}
                actionsClassName="mt-0"
              >
                <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                  {slide.imageUrl ? (
                    <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      No Img
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">{slide.title}</h3>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {slide.subtitle}
                  </p>
                  <p className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                    {slide.description}
                  </p>
                </div>
              </NeumorphBox>
            ))}
        </div>
      )}
    </div>
  );
}
