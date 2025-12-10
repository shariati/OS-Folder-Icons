'use client';

import { useState, useEffect } from 'react';
import { Page } from '@/lib/types';
import { RichTextEditor } from './RichTextEditor';
import { SocialShareTab } from './SocialShareTab';
import {
  Save,
  Globe,
  Image as ImageIcon,
  Eye,
  Search,
  Smartphone,
  Monitor,
  Share2,
} from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';
import { ImageUploader } from './ImageUploader';

interface PageEditorProps {
  page: Partial<Page>;
  onChange: (page: Partial<Page>) => void;
  onSave: () => void;
  isLoading?: boolean;
}

type Tab = 'write' | 'seo' | 'social' | 'preview';
type PreviewDevice = 'desktop' | 'mobile';

// Helper function to convert title to kebab-case slug
function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except spaces and dashes
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
}

export function PageEditor({ page, onChange, onSave, isLoading }: PageEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('write');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Auto-generate slug from title (kebab-case, lowercase)
  useEffect(() => {
    if (!slugManuallyEdited && page.title && !page.id) {
      const slug = toKebabCase(page.title);
      onChange({ ...page, slug });
    }
  }, [page.title, slugManuallyEdited, page.id, onChange, page]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    // Enforce kebab-case on manual input too
    const value = toKebabCase(e.target.value);
    onChange({ ...page, slug: value });
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900/50">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
            <button
              onClick={() => setActiveTab('write')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === 'write'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === 'seo'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              SEO
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === 'social'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Share2 size={14} />
              Social
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Preview
            </button>
          </div>
          <span className="text-sm text-gray-400">
            {page.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>

        <button
          onClick={onSave}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 hover:shadow disabled:opacity-50"
        >
          <Save size={18} />
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col xl:flex-row">
        {/* Editor Area */}
        <div className="flex-1">
          {activeTab === 'write' && (
            <div className="mx-auto max-w-4xl px-8 py-12">
              <input
                type="text"
                placeholder="Page Title"
                value={page.title || ''}
                onChange={(e) => onChange({ ...page, title: e.target.value })}
                className="mb-4 w-full border-none bg-transparent text-4xl font-bold text-gray-900 placeholder-gray-300 outline-none md:text-5xl dark:text-white dark:placeholder-gray-600"
              />

              <div className="mb-8 flex w-fit items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2 font-mono text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-800/50">
                <Globe size={14} />
                <span>/</span>
                <input
                  type="text"
                  value={page.slug || ''}
                  onChange={handleSlugChange}
                  placeholder="page-slug"
                  className="min-w-[200px] border-none bg-transparent text-gray-500 outline-none focus:text-blue-500 dark:text-gray-400"
                />
              </div>

              <div className="prose-editor min-h-[500px]">
                <RichTextEditor
                  value={page.content || ''}
                  onChange={(content) => onChange({ ...page, content })}
                  placeholder="Write your page content..."
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="mx-auto max-w-3xl space-y-8 px-8 py-12">
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                  <Search className="text-blue-500" />
                  Search Engine Optimization
                </h3>

                <div className="space-y-6">
                  <div>
                    <div className="mb-1 flex justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meta Title
                      </label>
                      <span
                        className={`text-xs ${(page.seoTitle?.length || 0) > 60 ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        {page.seoTitle?.length || 0}/60
                      </span>
                    </div>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                      placeholder="Title | Site Name"
                      value={page.seoTitle || ''}
                      onChange={(e) => onChange({ ...page, seoTitle: e.target.value })}
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meta Description
                      </label>
                      <span
                        className={`text-xs ${(page.seoDescription?.length || 0) > 160 ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        {page.seoDescription?.length || 0}/160
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                      placeholder="A short summary of your page..."
                      value={page.seoDescription || ''}
                      onChange={(e) => onChange({ ...page, seoDescription: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SERP Preview */}
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-bold">Google Search Preview</h3>
                <div className="max-w-[600px] font-sans">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs">
                      Fav
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#202124] dark:text-[#dadce0]">
                        My Site Name
                      </span>
                      <span className="text-xs text-[#5f6368] dark:text-[#bdc1c6]">
                        https://mysite.com › {page.slug || 'slug'}
                      </span>
                    </div>
                  </div>
                  <h3 className="truncated mb-1 cursor-pointer text-xl text-[#1a0dab] hover:underline dark:text-[#8ab4f8]">
                    {page.seoTitle || page.title || 'Page Title'}
                  </h3>
                  <p className="line-clamp-2 text-sm text-[#4d5156] dark:text-[#bdc1c6]">
                    {page.seoDescription || 'Page description...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <SocialShareTab
              social={page.social}
              onChange={(social) => onChange({ ...page, social })}
              title={page.title}
              description={page.seoDescription}
              coverImage={page.coverImage}
              slug={page.slug}
              type="page"
            />
          )}

          {activeTab === 'preview' && (
            <div className="flex h-full flex-col bg-gray-100 dark:bg-gray-950">
              <div className="flex justify-center gap-4 p-4">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`rounded p-2 ${previewDevice === 'desktop' ? 'bg-white text-blue-600 shadow' : 'text-gray-500'}`}
                >
                  <Monitor size={20} />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`rounded p-2 ${previewDevice === 'mobile' ? 'bg-white text-blue-600 shadow' : 'text-gray-500'}`}
                >
                  <Smartphone size={20} />
                </button>
              </div>
              <div className="flex flex-1 justify-center overflow-auto p-4">
                <div
                  className={`overflow-hidden bg-white shadow-2xl transition-all duration-300 dark:bg-gray-900 ${
                    previewDevice === 'mobile'
                      ? 'h-[667px] w-[375px] rounded-3xl border-8 border-gray-800'
                      : 'min-h-screen w-full max-w-5xl rounded-lg'
                  }`}
                >
                  <div className="prose dark:prose-invert h-full max-w-none overflow-y-auto p-8">
                    <h1>{page.title}</h1>
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content || '') }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Settings Panel */}
        <div className="hidden h-auto min-h-screen w-80 flex-shrink-0 flex-col border-l border-gray-200 bg-white p-6 xl:flex dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-6 text-xs font-bold uppercase tracking-wider text-gray-400">
            Page Settings
          </h3>

          <div className="flex-1 space-y-6 overflow-y-auto">
            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                value={page.status || 'draft'}
                onChange={(e) => onChange({ ...page, status: e.target.value as any })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Cover Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cover Image
              </label>
              <ImageUploader
                value={page.coverImage}
                onChange={(url) => onChange({ ...page, coverImage: url })}
                folder="pages"
                aspectRatio="video"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
