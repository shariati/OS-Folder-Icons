'use client';

import { useState, useEffect } from 'react';
import { Page } from '@/lib/types';
import { RichTextEditor } from './RichTextEditor';
import { ImageUploader } from './ImageUploader';
import { 
  Save, Globe, Search, Smartphone, Monitor
} from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';
import { getFullUrl } from '@/lib/url';

interface PageEditorProps {
  page: Partial<Page>;
  onChange: (page: Partial<Page>) => void;
  onSave: () => void;
  isLoading?: boolean;
}

type Tab = 'write' | 'seo' | 'preview';
type PreviewDevice = 'desktop' | 'mobile';

export function PageEditor({ page, onChange, onSave, isLoading }: PageEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('write');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && page.title && !page.id) {
      const slug = page.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      onChange({ ...page, slug });
    }
  }, [page.title, slugManuallyEdited, page.id, onChange, page]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    onChange({ ...page, slug: e.target.value });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900/50">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('write')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'write'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'seo'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              SEO
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
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
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-sm hover:shadow"
        >
          <Save size={18} />
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'write' && (
            <div className="max-w-4xl mx-auto px-8 py-12">
              <input
                type="text"
                placeholder="Page Title"
                value={page.title || ''}
                onChange={(e) => onChange({ ...page, title: e.target.value })}
                className="w-full text-4xl md:text-5xl font-bold bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600 text-gray-900 dark:text-white mb-4"
              />
              
              <div className="flex items-center gap-2 text-gray-400 mb-8 font-mono text-sm bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800 w-fit">
                <Globe size={14} />
                <span>/</span>
                <input
                  type="text"
                  value={page.slug || ''}
                  onChange={handleSlugChange}
                  className="bg-transparent border-none outline-none text-gray-500 dark:text-gray-400 focus:text-blue-500 min-w-[200px]"
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
            <div className="max-w-3xl mx-auto px-8 py-12 space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Search className="text-blue-500" />
                  Search Engine Optimization
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meta Title
                      </label>
                      <span className={`text-xs ${(page.seoTitle?.length || 0) > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                        {page.seoTitle?.length || 0}/60
                      </span>
                    </div>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Title | Site Name"
                      value={page.seoTitle || ''}
                      onChange={(e) => onChange({ ...page, seoTitle: e.target.value })}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meta Description
                      </label>
                      <span className={`text-xs ${(page.seoDescription?.length || 0) > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                        {page.seoDescription?.length || 0}/160
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                      placeholder="A short summary of your page..."
                      value={page.seoDescription || ''}
                      onChange={(e) => onChange({ ...page, seoDescription: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SERP Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4">Google Search Preview</h3>
                <div className="font-sans max-w-[600px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs">Fav</div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#202124] dark:text-[#dadce0]">My Site Name</span>
                      <span className="text-xs text-[#5f6368] dark:text-[#bdc1c6]">https://mysite.com › {page.slug || 'slug'}</span>
                    </div>
                  </div>
                  <h3 className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-1">
                    {page.seoTitle || page.title || 'Page Title'}
                  </h3>
                  <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
                    {page.seoDescription || 'Page description...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-950">
               <div className="flex justify-center p-4 gap-4">
                  <button 
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                  >
                    <Monitor size={20} />
                  </button>
                  <button 
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                  >
                    <Smartphone size={20} />
                  </button>
               </div>
               <div className="flex-1 overflow-auto p-4 flex justify-center">
                  <div className={`bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 overflow-hidden ${
                    previewDevice === 'mobile' ? 'w-[375px] h-[667px] rounded-3xl border-8 border-gray-800' : 'w-full max-w-5xl rounded-lg min-h-screen'
                  }`}>
                    <div className="h-full overflow-y-auto p-8 prose dark:prose-invert max-w-none">
                      <h1>{page.title}</h1>
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content || '') }} />
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar Settings Panel */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-full overflow-y-auto p-6 hidden xl:block">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
            Page Settings
          </h3>

          <div className="space-y-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                value={page.status || 'draft'}
                onChange={(e) => onChange({ ...page, status: e.target.value as any })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

             {/* Cover Image */}
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
