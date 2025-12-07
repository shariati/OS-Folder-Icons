'use client';

import { useState } from 'react';
import { DB, HeroSlide } from '@/lib/types';
import { Plus, Trash2, Edit2, Save, X, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { EmptyState } from '@/components/admin/EmptyState';
import { ImageUploader } from './ImageUploader';
import { authenticatedFetch } from '@/lib/fetch-auth';

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
        setSlides(slides.map(s => s.id === savedSlide.id ? savedSlide : s));
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

      setSlides(slides.filter(s => s.id !== id));
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
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Hero Slides</h2>
          <button
            onClick={startCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-blue-500/30"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isCreating ? 'New Slide' : 'Edit Slide'}
              </h3>
              <button onClick={() => { setEditingSlide(null); setIsCreating(false); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editingSlide.title}
                  onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={editingSlide.subtitle || ''}
                  onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingSlide.description}
                  onChange={e => setEditingSlide({ ...editingSlide, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link (e.g. /bundles/gaming)</label>
                <input
                  type="text"
                  value={editingSlide.link || ''}
                  onChange={e => setEditingSlide({ ...editingSlide, link: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background Image</label>
                <ImageUploader
                  value={editingSlide.imageUrl}
                  onChange={(url) => setEditingSlide({ ...editingSlide, imageUrl: url })}
                  folder="hero"
                  aspectRatio="video"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => { setEditingSlide(null); setIsCreating(false); }}
                  className="px-6 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingSlide)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-colors flex items-center gap-2"
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
            {slides.sort((a, b) => a.order - b.order).map((slide, index) => (
            <NeumorphBox 
                key={slide.id} 
                className="p-4 rounded-2xl flex items-center gap-4 group"
                showActions
                onEdit={() => setEditingSlide(slide)}
                onDelete={() => handleDelete(slide.id)}
                actionsClassName="mt-0"
            >
                <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {slide.imageUrl ? (
                        <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                    )}
                </div>
                
                <div className="flex-1">
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">{slide.title}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{slide.subtitle}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{slide.description}</p>
                </div>
            </NeumorphBox>
            ))}
        </div>
      )}
    </div>
  );
}
