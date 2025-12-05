'use client';

import { useState } from 'react';
import { DB, Page } from '@/lib/types';
import { savePageAction, deletePageAction } from '@/app/admin/actions';
import { useToast } from '@/components/ui/Toast';
import { SocialPreview } from '@/components/features/SocialPreview';
import { Plus, Edit, Trash2, Save, ArrowLeft, Eye } from 'lucide-react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';

interface PagesManagerProps {
  initialData: DB;
}

export function PagesManager({ initialData }: PagesManagerProps) {
  const [pages, setPages] = useState<Page[]>(initialData.pages || []);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState<Partial<Page>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleCreateNew = () => {
    setCurrentPage({
      id: Date.now().toString(),
      published: false,
    });
    setIsEditing(true);
  };

  const handleEdit = (page: Page) => {
    setCurrentPage(page);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      setIsLoading(true);
      await deletePageAction(id);
      setPages(pages.filter(p => p.id !== id));
      showToast('Page deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting page:', error);
      showToast('Failed to delete page', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPage.title || !currentPage.slug) {
      showToast('Title and Slug are required', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const pageToSave = currentPage as Page;
      
      // Auto-generate slug if empty
      if (!pageToSave.slug) {
        pageToSave.slug = pageToSave.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      await savePageAction(pageToSave);
      
      // Update local state
      const existingIndex = pages.findIndex(p => p.id === pageToSave.id);
      if (existingIndex !== -1) {
        const newPages = [...pages];
        newPages[existingIndex] = pageToSave;
        setPages(newPages);
      } else {
        setPages([...pages, pageToSave]);
      }

      setIsEditing(false);
      showToast('Page saved successfully', 'success');
    } catch (error) {
      console.error('Error saving page:', error);
      showToast('Failed to save page', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-9">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 rounded bg-white px-4 py-2 font-medium text-black hover:bg-opacity-90 dark:bg-boxdark dark:text-white"
          >
            <ArrowLeft size={20} />
            Back to List
          </button>
          <h2 className="text-xl font-bold text-black dark:text-white">
            {currentPage.id ? 'Edit Page' : 'New Page'}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-9 xl:grid-cols-2">
          <div className="flex flex-col gap-9">
            {/* Editor Form */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Page Content
                </h3>
              </div>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Title <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter page title"
                    value={currentPage.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setCurrentPage({ 
                        ...currentPage, 
                        title,
                        slug: !currentPage.id ? generateSlug(title) : currentPage.slug 
                      });
                    }}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Slug <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="page-url-slug"
                    value={currentPage.slug || ''}
                    onChange={(e) => setCurrentPage({ ...currentPage, slug: e.target.value })}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Content (Markdown supported)
                  </label>
                  <textarea
                    rows={10}
                    placeholder="Write your page content here..."
                    value={currentPage.content || ''}
                    onChange={(e) => setCurrentPage({ ...currentPage, content: e.target.value })}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input font-mono"
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label className="flex cursor-pointer items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={currentPage.published || false}
                        onChange={(e) => setCurrentPage({ ...currentPage, published: e.target.checked })}
                      />
                      <div className={`block h-8 w-14 rounded-full ${currentPage.published ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <div className={`dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${currentPage.published ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <div className="ml-3 font-medium text-black dark:text-white">
                      Published
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  {isLoading ? 'Saving...' : (
                    <span className="flex items-center gap-2">
                      <Save size={20} />
                      Save Page
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-9">
            {/* SEO & Preview */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  SEO Settings
                </h3>
              </div>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty to use page title"
                    value={currentPage.seoTitle || ''}
                    onChange={(e) => setCurrentPage({ ...currentPage, seoTitle: e.target.value })}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    SEO Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Page description for SEO"
                    value={currentPage.seoDescription || ''}
                    onChange={(e) => setCurrentPage({ ...currentPage, seoDescription: e.target.value })}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  ></textarea>
                </div>
              </div>
            </div>

            <SocialPreview
              title={currentPage.seoTitle || currentPage.title || 'Page Title'}
              description={currentPage.seoDescription || 'Page description...'}
              url={`example.com/${currentPage.slug || 'slug'}`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pages</h2>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-blue-500/30"
        >
          <Plus size={18} />
          New Page
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.length > 0 ? (
          pages.map((page) => (
            <NeumorphBox 
              key={page.id}
              title={page.title}
              subtitle={`/${page.slug}`}
              showActions
              onEdit={() => handleEdit(page)}
              onDelete={() => handleDelete(page.id)}
              badge={
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${page.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                  {page.published ? 'Published' : 'Draft'}
                </span>
              }
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No pages found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
