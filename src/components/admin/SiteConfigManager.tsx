'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Settings,
  FaviconConfig,
  TrackingConfig,
  DefaultSeoConfig,
  SiteIdentity,
  SocialMetadata,
} from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { ImageUploader } from './ImageUploader';
import { authenticatedFetch } from '@/lib/fetch-auth';
import {
  Globe,
  Image as ImageIcon,
  Code,
  Search,
  Share2,
  Save,
  Loader2,
  Edit2,
  X,
  Check,
  Upload,
} from 'lucide-react';
import clsx from 'clsx';

type TabType = 'identity' | 'favicon' | 'tracking' | 'seo' | 'social';

export function SiteConfigManager() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const { showToast } = useToast();

  // Editing states for tracking codes
  const [editingClarity, setEditingClarity] = useState(false);
  const [editingGA, setEditingGA] = useState(false);
  const [editingAdsense, setEditingAdsense] = useState(false);
  const [tempTracking, setTempTracking] = useState<TrackingConfig>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setTempTracking(data.tracking || {});
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
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSiteIdentity = (key: keyof SiteIdentity, value: string) => {
    setSettings((prev) => ({
      ...prev,
      siteIdentity: { ...prev.siteIdentity, [key]: value },
    }));
  };

  const updateFavicon = (key: keyof FaviconConfig, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      favicon: { ...prev.favicon, [key]: value },
    }));
  };

  const updateDefaultSeo = (key: keyof DefaultSeoConfig, value: any) => {
    setSettings((prev) => ({
      ...prev,
      defaultSeo: { ...prev.defaultSeo, [key]: value },
    }));
  };

  const updateDefaultSocial = (key: keyof SocialMetadata, value: any) => {
    setSettings((prev) => ({
      ...prev,
      defaultSocial: { ...prev.defaultSocial, [key]: value },
    }));
  };

  const tabs = [
    { id: 'identity' as const, label: 'Site Identity', icon: Globe },
    { id: 'favicon' as const, label: 'Favicons', icon: ImageIcon },
    { id: 'tracking' as const, label: 'Tracking Codes', icon: Code },
    { id: 'seo' as const, label: 'Default SEO', icon: Search },
    { id: 'social' as const, label: 'Social Share', icon: Share2 },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all',
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <NeumorphBox className="rounded-2xl p-6">
        {/* Site Identity Tab */}
        {activeTab === 'identity' && (
          <div className="space-y-6">
            <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">Site Identity</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Site Logo (Light Mode)
                </label>
                <ImageUploader
                  value={settings.siteIdentity?.logo}
                  onChange={(url) => updateSiteIdentity('logo', url)}
                  folder="site"
                  aspectRatio="video"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Site Logo (Dark Mode)
                </label>
                <ImageUploader
                  value={settings.siteIdentity?.darkLogo}
                  onChange={(url) => updateSiteIdentity('darkLogo', url)}
                  folder="site"
                  aspectRatio="video"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteIdentity?.siteName || ''}
                onChange={(e) => updateSiteIdentity('siteName', e.target.value)}
                placeholder="My Awesome Site"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Headline
              </label>
              <input
                type="text"
                value={settings.siteIdentity?.headline || ''}
                onChange={(e) => updateSiteIdentity('headline', e.target.value)}
                placeholder="Your main headline"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tagline
              </label>
              <input
                type="text"
                value={settings.siteIdentity?.tagline || ''}
                onChange={(e) => updateSiteIdentity('tagline', e.target.value)}
                placeholder="Your catchy tagline"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              onClick={() => handleSave({ siteIdentity: settings.siteIdentity })}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Site Identity
            </button>
          </div>
        )}

        {/* Favicons Tab */}
        {activeTab === 'favicon' && (
          <FaviconTab
            settings={settings}
            updateFavicon={updateFavicon}
            handleSave={handleSave}
            saving={saving}
          />
        )}

        {/* Tracking Codes Tab */}
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">Tracking Codes</h3>

            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Add your tracking and analytics codes. These will be included in all pages.
            </p>

            {/* Microsoft Clarity */}
            <TrackingCodeField
              label="Microsoft Clarity Project ID"
              value={settings.tracking?.clarityCode || ''}
              tempValue={tempTracking.clarityCode || ''}
              isEditing={editingClarity}
              onEdit={() => {
                setTempTracking({
                  ...tempTracking,
                  clarityCode: settings.tracking?.clarityCode || '',
                });
                setEditingClarity(true);
              }}
              onCancel={() => {
                setTempTracking({
                  ...tempTracking,
                  clarityCode: settings.tracking?.clarityCode || '',
                });
                setEditingClarity(false);
              }}
              onSave={async () => {
                await handleSave({
                  tracking: { ...settings.tracking, clarityCode: tempTracking.clarityCode },
                });
                setEditingClarity(false);
              }}
              onChange={(val) => setTempTracking({ ...tempTracking, clarityCode: val })}
              placeholder="Enter your Clarity Project ID"
              saving={saving}
            />

            {/* Google Analytics */}
            <TrackingCodeField
              label="Google Analytics Measurement ID"
              value={settings.tracking?.googleAnalyticsCode || ''}
              tempValue={tempTracking.googleAnalyticsCode || ''}
              isEditing={editingGA}
              onEdit={() => {
                setTempTracking({
                  ...tempTracking,
                  googleAnalyticsCode: settings.tracking?.googleAnalyticsCode || '',
                });
                setEditingGA(true);
              }}
              onCancel={() => {
                setTempTracking({
                  ...tempTracking,
                  googleAnalyticsCode: settings.tracking?.googleAnalyticsCode || '',
                });
                setEditingGA(false);
              }}
              onSave={async () => {
                await handleSave({
                  tracking: {
                    ...settings.tracking,
                    googleAnalyticsCode: tempTracking.googleAnalyticsCode,
                  },
                });
                setEditingGA(false);
              }}
              onChange={(val) => setTempTracking({ ...tempTracking, googleAnalyticsCode: val })}
              placeholder="G-XXXXXXXXXX"
              saving={saving}
            />

            {/* Google AdSense */}
            <TrackingCodeField
              label="Google AdSense Publisher ID"
              value={settings.tracking?.googleAdsenseCode || ''}
              tempValue={tempTracking.googleAdsenseCode || ''}
              isEditing={editingAdsense}
              onEdit={() => {
                setTempTracking({
                  ...tempTracking,
                  googleAdsenseCode: settings.tracking?.googleAdsenseCode || '',
                });
                setEditingAdsense(true);
              }}
              onCancel={() => {
                setTempTracking({
                  ...tempTracking,
                  googleAdsenseCode: settings.tracking?.googleAdsenseCode || '',
                });
                setEditingAdsense(false);
              }}
              onSave={async () => {
                await handleSave({
                  tracking: {
                    ...settings.tracking,
                    googleAdsenseCode: tempTracking.googleAdsenseCode,
                  },
                });
                setEditingAdsense(false);
              }}
              onChange={(val) => setTempTracking({ ...tempTracking, googleAdsenseCode: val })}
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              saving={saving}
            />
          </div>
        )}

        {/* Default SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
              Default SEO Settings
            </h3>

            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              These values will be used as fallbacks for pages and posts that don&apos;t have custom
              SEO settings.
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Title
              </label>
              <input
                type="text"
                value={settings.defaultSeo?.title || ''}
                onChange={(e) => updateDefaultSeo('title', e.target.value)}
                placeholder="Your Site - Tagline"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Description
              </label>
              <textarea
                value={settings.defaultSeo?.description || ''}
                onChange={(e) => updateDefaultSeo('description', e.target.value)}
                placeholder="A brief description of your site..."
                rows={3}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={settings.defaultSeo?.keywords?.join(', ') || ''}
                onChange={(e) =>
                  updateDefaultSeo(
                    'keywords',
                    e.target.value
                      .split(',')
                      .map((k) => k.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="keyword1, keyword2, keyword3"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default OG Image
              </label>
              <ImageUploader
                value={settings.defaultSeo?.ogImage}
                onChange={(url) => updateDefaultSeo('ogImage', url)}
                folder="seo"
                aspectRatio="video"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Twitter Card Type
              </label>
              <select
                value={settings.defaultSeo?.twitterCard || 'summary_large_image'}
                onChange={(e) => updateDefaultSeo('twitterCard', e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary with Large Image</option>
              </select>
            </div>

            <button
              onClick={() => handleSave({ defaultSeo: settings.defaultSeo })}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Default SEO
            </button>
          </div>
        )}

        {/* Social Share Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
              Default Social Share Settings
            </h3>

            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Configure how your content appears when shared on social media platforms.
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default OG Title
              </label>
              <input
                type="text"
                value={settings.defaultSocial?.ogTitle || ''}
                onChange={(e) => updateDefaultSocial('ogTitle', e.target.value)}
                placeholder="Title for social shares"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default OG Description
              </label>
              <textarea
                value={settings.defaultSocial?.ogDescription || ''}
                onChange={(e) => updateDefaultSocial('ogDescription', e.target.value)}
                placeholder="Description for social shares"
                rows={3}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Social Image
              </label>
              <ImageUploader
                value={settings.defaultSocial?.ogImage}
                onChange={(url) => updateDefaultSocial('ogImage', url)}
                folder="social"
                aspectRatio="video"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default OG Type
              </label>
              <select
                value={settings.defaultSocial?.ogType || 'website'}
                onChange={(e) => updateDefaultSocial('ogType', e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="website">Website</option>
                <option value="article">Article</option>
                <option value="blog">Blog</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Twitter Title
              </label>
              <input
                type="text"
                value={settings.defaultSocial?.twitterTitle || ''}
                onChange={(e) => updateDefaultSocial('twitterTitle', e.target.value)}
                placeholder="Title for Twitter cards (optional, uses OG title if empty)"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Twitter Description
              </label>
              <textarea
                value={settings.defaultSocial?.twitterDescription || ''}
                onChange={(e) => updateDefaultSocial('twitterDescription', e.target.value)}
                placeholder="Description for Twitter cards (optional)"
                rows={2}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              onClick={() => handleSave({ defaultSocial: settings.defaultSocial })}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Social Settings
            </button>
          </div>
        )}
      </NeumorphBox>
    </div>
  );
}

// Favicon sizes configuration
const FAVICON_SIZES = [
  { key: 'favicon16' as const, size: 16, label: '16×16', description: 'Browser Tabs' },
  { key: 'favicon32' as const, size: 32, label: '32×32', description: 'New Tab, Desktop' },
  { key: 'favicon48' as const, size: 48, label: '48×48', description: 'Windows Taskbar' },
  { key: 'appleTouch180' as const, size: 180, label: '180×180', description: 'Apple Touch' },
  { key: 'android192' as const, size: 192, label: '192×192', description: 'Android Chrome' },
  { key: 'android512' as const, size: 512, label: '512×512', description: 'PWA Splash' },
];

// App background shapes for favicons
const APP_BACKGROUND_SHAPES = [
  { id: 'circle' as const, label: 'Circle', className: 'rounded-full' },
  { id: 'rounded' as const, label: 'Rounded', className: 'rounded-xl' },
  { id: 'square' as const, label: 'Square', className: 'rounded-none' },
];

// Predefined background colors suitable for favicons (high contrast, modern palette)
const APP_BACKGROUND_COLORS = [
  { id: 'blue', color: '#3B82F6', label: 'Blue' }, // Vibrant blue - trustworthy, professional
  { id: 'indigo', color: '#6366F1', label: 'Indigo' }, // Deep indigo - creative, premium
  { id: 'violet', color: '#8B5CF6', label: 'Violet' }, // Purple - innovative, luxurious
  { id: 'pink', color: '#EC4899', label: 'Pink' }, // Hot pink - bold, energetic
  { id: 'red', color: '#EF4444', label: 'Red' }, // Vibrant red - urgent, passionate
  { id: 'orange', color: '#F97316', label: 'Orange' }, // Orange - friendly, enthusiastic
  { id: 'emerald', color: '#10B981', label: 'Emerald' }, // Green - growth, success
  { id: 'teal', color: '#14B8A6', label: 'Teal' }, // Teal - calm, sophisticated
  { id: 'cyan', color: '#06B6D4', label: 'Cyan' }, // Cyan - fresh, modern
  { id: 'slate', color: '#475569', label: 'Slate' }, // Dark slate - minimal, elegant
  { id: 'black', color: '#18181B', label: 'Black' }, // Near black - premium, sleek
  { id: 'white', color: '#FFFFFF', label: 'White' }, // White - clean, minimal
];

// FaviconTab component with auto-generation
function FaviconTab({
  settings,
  updateFavicon,
  handleSave,
  saving,
}: {
  settings: Settings;
  updateFavicon: (key: keyof FaviconConfig, value: string | boolean) => void;
  handleSave: (updates: Partial<Settings>) => Promise<void>;
  saving: boolean;
}) {
  const [generating, setGenerating] = useState(false);
  const [editingSize, setEditingSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Generate resized images from source
  const generateFavicons = async (sourceUrl: string) => {
    setGenerating(true);
    try {
      // Load the source image
      const img = new window.Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = sourceUrl;
      });

      // Generate each size
      for (const { key, size } of FAVICON_SIZES) {
        if (key === 'android512') continue; // Skip 512, it's the source

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        // Use high-quality image scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, size, size);

        // Convert to blob and upload
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/png', 1.0);
        });

        if (blob) {
          const url = await uploadBlob(blob, `favicon-${size}.png`);
          updateFavicon(key, url);
        }
      }

      showToast('All favicon sizes generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating favicons:', error);
      showToast('Failed to generate some favicon sizes', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Upload a blob to storage
  const uploadBlob = async (blob: Blob, filename: string): Promise<string> => {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { storage } = await import('@/lib/firebase/client');
    if (!storage) throw new Error('Storage not initialized');

    const { v4: uuidv4 } = await import('uuid');
    const uniqueFilename = `${uuidv4()}-${filename}`;
    const storageRef = ref(storage, `favicon/${uniqueFilename}`);
    const snapshot = await uploadBytes(storageRef, blob);
    return getDownloadURL(snapshot.ref);
  };

  // Handle source image upload
  const handleSourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    setGenerating(true);
    try {
      // Upload the source image first
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('@/lib/firebase/client');
      if (!storage) throw new Error('Storage not initialized');

      const { v4: uuidv4 } = await import('uuid');
      const filename = `${uuidv4()}-source-512.png`;
      const storageRef = ref(storage, `favicon/${filename}`);
      const snapshot = await uploadBytes(storageRef, file);
      const sourceUrl = await getDownloadURL(snapshot.ref);

      // Update the 512x512 favicon
      updateFavicon('android512', sourceUrl);

      // Generate all other sizes from this source
      await generateFavicons(sourceUrl);
    } catch (error) {
      console.error('Error uploading source:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setGenerating(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle individual size edit
  const handleEditSize = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof FaviconConfig
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadBlob(file, `favicon-custom-${key}.png`);
      updateFavicon(key, url);
      showToast('Favicon updated', 'success');
    } catch (error) {
      console.error('Error uploading:', error);
      showToast('Failed to upload', 'error');
    } finally {
      setEditingSize(null);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  const hasAnyFavicon = FAVICON_SIZES.some(({ key }) => settings.favicon?.[key]);

  return (
    <div className="space-y-6">
      <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
        Favicon Configuration
      </h3>

      {/* Source Upload Section */}
      <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-700 dark:from-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <ImageIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
            Upload Master Favicon (512×512)
          </h4>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Upload a single high-resolution image and we&apos;ll automatically generate all required
            sizes
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleSourceUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={generating}
            className="mx-auto flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating all sizes...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload & Generate All Sizes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animated Favicon Toggle */}
      <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
        <input
          type="checkbox"
          id="useAnimated"
          checked={settings.favicon?.useAnimated || false}
          onChange={(e) => updateFavicon('useAnimated', e.target.checked)}
          className="h-5 w-5 rounded text-blue-600"
        />
        <label
          htmlFor="useAnimated"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Use animated favicon (GIF/APNG/WebP)
        </label>
      </div>

      {settings.favicon?.useAnimated && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Animated Favicon
          </label>
          <ImageUploader
            value={settings.favicon?.animatedFavicon}
            onChange={(url) => updateFavicon('animatedFavicon', url)}
            folder="favicon"
            aspectRatio="square"
          />
        </div>
      )}

      {/* Preview Grid */}
      {hasAnyFavicon && (
        <div>
          <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Generated Favicons Preview
          </h4>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Click &quot;Edit&quot; on any size to replace it with a custom image
          </p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {FAVICON_SIZES.map(({ key, size, label, description }) => {
              const imageUrl = settings.favicon?.[key];
              // Calculate preview size (max 64px for display, but show actual for larger)
              const previewSize = Math.min(size, 64);

              return (
                <div
                  key={key}
                  className="group relative flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  {/* Preview container with checkered background for transparency */}
                  <div
                    className="mb-3 flex items-center justify-center rounded-lg"
                    style={{
                      width: previewSize + 16,
                      height: previewSize + 16,
                      backgroundImage:
                        'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                      backgroundSize: '8px 8px',
                      backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={label}
                        style={{ width: previewSize, height: previewSize }}
                        className="rounded"
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center rounded bg-gray-200 dark:bg-gray-700"
                        style={{ width: previewSize, height: previewSize }}
                      >
                        <ImageIcon size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span className="text-xs font-bold text-gray-800 dark:text-white">{label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>

                  {/* Edit button overlay */}
                  <button
                    onClick={() => {
                      setEditingSize(key);
                      setTimeout(() => editFileInputRef.current?.click(), 0);
                    }}
                    className="absolute right-2 top-2 rounded-lg bg-blue-600 p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                    title="Replace with custom image"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Hidden file input for editing individual sizes */}
          <input
            ref={editFileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => editingSize && handleEditSize(e, editingSize as keyof FaviconConfig)}
            className="hidden"
          />
        </div>
      )}

      {/* App Background Shape & Color */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">App Icon Background</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose a background shape and color for your app icons (used in mobile home screens)
        </p>

        {/* Shape Selector */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Background Shape
          </label>
          <div className="flex gap-4">
            {APP_BACKGROUND_SHAPES.map(({ id, label, className }) => (
              <button
                key={id}
                onClick={() => updateFavicon('appBackgroundShape', id)}
                className={clsx(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                  settings.favicon?.appBackgroundShape === id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                )}
              >
                <div className={clsx('h-12 w-12 bg-gray-300 dark:bg-gray-600', className)} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Selector */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Background Color
          </label>
          <div className="flex flex-wrap gap-3">
            {APP_BACKGROUND_COLORS.map(({ id, color, label }) => (
              <button
                key={id}
                onClick={() => updateFavicon('appBackgroundColor', color)}
                title={label}
                className={clsx(
                  'relative h-10 w-10 transition-all',
                  settings.favicon?.appBackgroundShape === 'circle'
                    ? 'rounded-full'
                    : settings.favicon?.appBackgroundShape === 'rounded'
                      ? 'rounded-xl'
                      : 'rounded-none',
                  settings.favicon?.appBackgroundColor === color
                    ? 'scale-110 ring-2 ring-blue-500 ring-offset-2'
                    : 'hover:scale-105'
                )}
                style={{ backgroundColor: color }}
              >
                {settings.favicon?.appBackgroundColor === color && (
                  <Check className="absolute inset-0 m-auto text-white drop-shadow-md" size={18} />
                )}
              </button>
            ))}
          </div>

          {/* Preview */}
          {(settings.favicon?.appBackgroundShape || settings.favicon?.appBackgroundColor) && (
            <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
              <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                Preview
              </label>
              <div className="flex items-center gap-4">
                {[64, 48, 32].map((size) => (
                  <div
                    key={size}
                    className={clsx(
                      'flex items-center justify-center',
                      settings.favicon?.appBackgroundShape === 'circle'
                        ? 'rounded-full'
                        : settings.favicon?.appBackgroundShape === 'rounded'
                          ? 'rounded-xl'
                          : 'rounded-none'
                    )}
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: settings.favicon?.appBackgroundColor || '#3B82F6',
                    }}
                  >
                    {settings.favicon?.android512 && (
                      <img
                        src={settings.favicon.android512}
                        alt="Preview"
                        className="h-3/4 w-3/4 object-contain"
                      />
                    )}
                  </div>
                ))}
                <span className="text-xs text-gray-400">64px / 48px / 32px</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={() => handleSave({ favicon: settings.favicon })}
        disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        Save Favicons
      </button>
    </div>
  );
}

// Favicon upload box component (kept for backwards compatibility but not used in new UI)
function FaviconUploadBox({
  label,
  value,
  onChange,
  size,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  size: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-xs text-gray-400">{size}</span>
      </div>
      <ImageUploader value={value} onChange={onChange} folder="favicon" aspectRatio="square" />
    </div>
  );
}

// Tracking code field component with edit mode
function TrackingCodeField({
  label,
  value,
  tempValue,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onChange,
  placeholder,
  saving,
}: {
  label: string;
  value: string;
  tempValue: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (val: string) => void;
  placeholder: string;
  saving: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Edit2 size={14} />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={tempValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-1 rounded-lg px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-gray-100 px-4 py-2 font-mono text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {value || <span className="italic text-gray-400">Not configured</span>}
        </div>
      )}
    </div>
  );
}
