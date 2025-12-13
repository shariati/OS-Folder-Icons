'use client';

import { useState, useEffect } from 'react';
import { Settings } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { ImageUploader } from './ImageUploader';
import { authenticatedFetch } from '@/lib/fetch-auth';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';

export function PhotoFrameManager() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updates: Partial<Settings>) => {
    setSaving(true);
    try {
      const res = await authenticatedFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to save');

      const newSettings = await res.json();
      setSettings(newSettings);
      showToast('Photo Frame settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updatePhotoFrame = (key: 'previewBackgroundUrl', value: string) => {
    setSettings((prev) => ({
      ...prev,
      photoFrame: { ...prev.photoFrame, [key]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Photo Frame Settings</h2>
      </div>

      <NeumorphBox className="space-y-6 p-6">
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
            <ImageIcon className="text-blue-500" size={24} />
            Preview Background
          </h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Upload a background image for the Photo Frame preview area. This image is only for
            visual purposes in the preview and will NOT be included in the downloaded image.
          </p>

          <div className="max-w-xl">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Background Image (Wallpaper)
            </label>
            <ImageUploader
              value={settings.photoFrame?.previewBackgroundUrl}
              onChange={(url) => updatePhotoFrame('previewBackgroundUrl', url)}
              folder="photo-frame"
              aspectRatio="video"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={() => handleSave({ photoFrame: settings.photoFrame })}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </NeumorphBox>
    </div>
  );
}
