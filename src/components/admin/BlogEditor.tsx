'use client';

import { useState, useEffect } from 'react';
import { BlogPost, Tag } from '@/lib/types';
import { RichTextEditor } from './RichTextEditor';
import { SocialShareTab } from './SocialShareTab';
import { 
  Save, Globe, Calendar, User as UserIcon, 
  Image as ImageIcon, Tag as TagIcon, Eye, Settings, 
  Layout, Search, CheckCircle, Smartphone, Monitor, Share2
} from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';
import { getFullUrl } from '@/lib/url';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { ImageUploader } from './ImageUploader';
import { TagAutocomplete } from './TagAutocomplete';

interface BlogEditorProps {
  post: Partial<BlogPost>;
  onChange: (post: Partial<BlogPost>) => void;
  onSave: () => void;
  isLoading?: boolean;
  availableTags?: Tag[];
  onCreateTag?: (name: string) => Promise<Tag>;
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

export function BlogEditor({ post, onChange, onSave, isLoading, availableTags = [], onCreateTag }: BlogEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('write');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Auto-generate slug from title (kebab-case, lowercase)
  useEffect(() => {
    if (!slugManuallyEdited && post.title && !post.id) {
      const slug = toKebabCase(post.title);
      onChange({ ...post, slug });
    }
  }, [post.title, slugManuallyEdited, post.id, onChange, post]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    // Enforce kebab-case on manual input too
    const value = toKebabCase(e.target.value);
    onChange({ ...post, slug: value });
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
              onClick={() => setActiveTab('social')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'social'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <Share2 size={14} />
              Social
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
            {post.status === 'published' ? 'Published' : 'Draft'}
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
                placeholder="Post Title"
                value={post.title || ''}
                onChange={(e) => onChange({ ...post, title: e.target.value })}
                className="w-full text-4xl md:text-5xl font-bold bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600 text-gray-900 dark:text-white mb-4"
              />
              
              <div className="flex items-center gap-2 text-gray-400 mb-8 font-mono text-sm bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800 w-fit">
                <Globe size={14} />
                <span>/blog/</span>
                <input
                  type="text"
                  value={post.slug || ''}
                  onChange={handleSlugChange}
                  placeholder="post-slug"
                  className="bg-transparent border-none outline-none text-gray-500 dark:text-gray-400 focus:text-blue-500 min-w-[200px]"
                />
              </div>

              <div className="prose-editor min-h-[500px]">
                <RichTextEditor
                  value={post.content || ''}
                  onChange={(content) => onChange({ ...post, content })}
                  placeholder="Tell your story..."
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Focus Keyword
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="e.g. UX Design"
                      value={post.focusKeyword || ''}
                      onChange={(e) => onChange({ ...post, focusKeyword: e.target.value })}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meta Title
                      </label>
                      <span className={`text-xs ${(post.seoTitle?.length || 0) > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                        {post.seoTitle?.length || 0}/60
                      </span>
                    </div>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Title | Site Name"
                      value={post.seoTitle || ''}
                      onChange={(e) => onChange({ ...post, seoTitle: e.target.value })}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meta Description
                      </label>
                      <span className={`text-xs ${(post.seoDescription?.length || 0) > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                        {post.seoDescription?.length || 0}/160
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                      placeholder="A short summary of your post..."
                      value={post.seoDescription || ''}
                      onChange={(e) => onChange({ ...post, seoDescription: e.target.value })}
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
                      <span className="text-xs text-[#5f6368] dark:text-[#bdc1c6]">https://mysite.com › blog › {post.slug || 'slug'}</span>
                    </div>
                  </div>
                  <h3 className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-1 truncated">
                    {post.seoTitle || post.title || 'Post Title'}
                  </h3>
                  <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
                    {post.seoDescription || post.excerpt || 'Focus keyword description...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <SocialShareTab
              social={post.social}
              onChange={(social) => onChange({ ...post, social })}
              title={post.title}
              description={post.seoDescription || post.excerpt}
              coverImage={post.coverImage}
              slug={post.slug}
              type="blog"
            />
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
                      <h1>{post.title}</h1>
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || '') }} />
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar Settings Panel - Fixed height, no scroll */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-shrink-0 p-6 hidden xl:flex flex-col">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
            Post Settings
          </h3>

          <div className="space-y-6 flex-1 overflow-y-auto">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                value={post.status || 'draft'}
                onChange={(e) => onChange({ ...post, status: e.target.value as any })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Publish Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="date"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                  value={post.publishedAt ? post.publishedAt.split('T')[0] : ''}
                  onChange={(e) => onChange({ ...post, publishedAt: new Date(e.target.value).toISOString() })}
                />
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Author
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <select
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    value={post.authorId || 'admin'}
                    onChange={(e) => onChange({ ...post, authorId: e.target.value })}
                >
                    <option value="admin">Admin</option>
                    {/* Add other users here later */}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <TagAutocomplete
                selectedTags={post.tags || []}
                availableTags={availableTags}
                onChange={(tags) => onChange({ ...post, tags })}
                onCreateTag={onCreateTag}
              />
            </div>

             {/* Cover Image */}
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Featured Image
              </label>
              <ImageUploader
                value={post.coverImage}
                onChange={(url) => onChange({ ...post, coverImage: url })}
                folder="blogs"
                aspectRatio="video"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
