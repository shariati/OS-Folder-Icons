'use client';

import {
  Calendar,
  Globe,
  Monitor,
  Save,
  Search,
  Share2,
  Smartphone,
  User as UserIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { sanitizeHtml } from '@/lib/sanitize';
import { BlogPost, Tag } from '@/lib/types';

import { ImageUploader } from './ImageUploader';
import { RichTextEditor } from './RichTextEditor';
import { SocialShareTab } from './SocialShareTab';
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

export function BlogEditor({
  post,
  onChange,
  onSave,
  isLoading,
  availableTags = [],
  onCreateTag,
}: BlogEditorProps) {
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
            {post.status === 'published' ? 'Published' : 'Draft'}
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
                placeholder="Post Title"
                value={post.title || ''}
                onChange={(e) => onChange({ ...post, title: e.target.value })}
                className="mb-4 w-full border-none bg-transparent text-4xl font-bold text-gray-900 placeholder-gray-300 outline-none md:text-5xl dark:text-white dark:placeholder-gray-600"
              />

              <div className="mb-8 flex w-fit items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2 font-mono text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-800/50">
                <Globe size={14} />
                <span>/blog/</span>
                <input
                  type="text"
                  value={post.slug || ''}
                  onChange={handleSlugChange}
                  placeholder="post-slug"
                  className="min-w-[200px] border-none bg-transparent text-gray-500 outline-none focus:text-blue-500 dark:text-gray-400"
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
            <div className="mx-auto max-w-3xl space-y-8 px-8 py-12">
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                  <Search className="text-blue-500" />
                  Search Engine Optimization
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Focus Keyword
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                      placeholder="e.g. UX Design"
                      value={post.focusKeyword || ''}
                      onChange={(e) => onChange({ ...post, focusKeyword: e.target.value })}
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meta Title
                      </label>
                      <span
                        className={`text-xs ${(post.seoTitle?.length || 0) > 60 ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        {post.seoTitle?.length || 0}/60
                      </span>
                    </div>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                      placeholder="Title | Site Name"
                      value={post.seoTitle || ''}
                      onChange={(e) => onChange({ ...post, seoTitle: e.target.value })}
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meta Description
                      </label>
                      <span
                        className={`text-xs ${(post.seoDescription?.length || 0) > 160 ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        {post.seoDescription?.length || 0}/160
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                      placeholder="A short summary of your post..."
                      value={post.seoDescription || ''}
                      onChange={(e) => onChange({ ...post, seoDescription: e.target.value })}
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
                        https://mysite.com › blog › {post.slug || 'slug'}
                      </span>
                    </div>
                  </div>
                  <h3 className="truncated mb-1 cursor-pointer text-xl text-[#1a0dab] hover:underline dark:text-[#8ab4f8]">
                    {post.seoTitle || post.title || 'Post Title'}
                  </h3>
                  <p className="line-clamp-2 text-sm text-[#4d5156] dark:text-[#bdc1c6]">
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
                    <h1>{post.title}</h1>
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || '') }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Settings Panel - Fixed height, no scroll */}
        <div className="hidden h-auto min-h-screen w-80 flex-shrink-0 flex-col border-l border-gray-200 bg-white p-6 xl:flex dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-6 text-xs font-bold uppercase tracking-wider text-gray-400">
            Post Settings
          </h3>

          <div className="flex-1 space-y-6 overflow-y-auto">
            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
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
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Publish Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  value={post.publishedAt ? post.publishedAt.split('T')[0] : ''}
                  onChange={(e) =>
                    onChange({ ...post, publishedAt: new Date(e.target.value).toISOString() })
                  }
                />
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Author
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <select
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
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
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
