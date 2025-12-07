'use client';

import { useState, useMemo } from 'react';
import { DB, Page } from '@/lib/types';
import { savePageAction, deletePageAction } from '@/app/admin/actions';
import { useToast } from '@/components/ui/Toast';
import { Plus, ExternalLink, Search, FileText, Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageEditor } from './PageEditor';
import { getFullUrl } from '@/lib/url';
import { socialStyleLargeNumbers } from '@/lib/format';
import clsx from 'clsx';

interface PagesManagerProps {
  initialData: DB;
}

const ITEMS_PER_PAGE = 10;

export function PagesManager({ initialData }: PagesManagerProps) {
  const [pages, setPages] = useState<Page[]>(initialData.pages || []);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState<Partial<Page>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const { showToast } = useToast();

  // Filter and sort pages
  const filteredPages = useMemo(() => {
    return pages
      .filter(page => {
        const matchesSearch = 
          page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.slug?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [pages, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPages.length / ITEMS_PER_PAGE);
  const paginatedPages = filteredPages.slice(
    (currentPageNum - 1) * ITEMS_PER_PAGE,
    currentPageNum * ITEMS_PER_PAGE
  );

  const handleCreateNew = () => {
    setCurrentPage({
      id: Date.now().toString(),
      status: 'draft',
      authorId: 'admin',
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

      // Ensure creation date
      if (!pageToSave.createdAt) {
          pageToSave.createdAt = new Date().toISOString();
      }
      pageToSave.updatedAt = new Date().toISOString();

      await savePageAction(pageToSave);
      
      // Update local state
      const existingIndex = pages.findIndex(p => p.id === pageToSave.id);
      if (existingIndex !== -1) {
        const newPages = [...pages];
        newPages[existingIndex] = pageToSave;
        setPages(newPages);
      } else {
        setPages([pageToSave, ...pages]);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isEditing) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-4 flex items-center gap-4 px-6 pt-4">
            <button
                onClick={() => setIsEditing(false)}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
                &larr; Back to Pages
            </button>
        </div>
        <div className="flex-1 overflow-hidden">
            <PageEditor
                page={currentPage}
                onChange={setCurrentPage}
                onSave={handleSave}
                isLoading={isLoading}
            />
        </div>
      </div>
    );
  }

  return (
    <NeumorphBox className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h3 className="font-bold text-xl text-black dark:text-white flex items-center gap-2">
          <FileText size={24} className="text-primary" />
          Pages Management
        </h3>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={18} />
          New Page
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex gap-2">
          {(['all', 'draft', 'published'] as const).map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setCurrentPageNum(1); }}
              className={clsx(
                "px-4 py-2 rounded-xl font-medium text-sm transition-all capitalize",
                statusFilter === status
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-md">
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPageNum(1); }}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-800"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Table */}
      {filteredPages.length === 0 ? (
        <EmptyState
          title="No pages found"
          description={searchTerm || statusFilter !== 'all' ? "Try adjusting your search or filters." : "Create your first page to get started."}
          actionLabel={!searchTerm && statusFilter === 'all' ? "Create Page" : undefined}
          onAction={!searchTerm && statusFilter === 'all' ? handleCreateNew : undefined}
        />
      ) : (
        <>
          <div className="max-w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Title</th>
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Slug</th>
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Author</th>
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Created</th>
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Views</th>
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {paginatedPages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-black dark:text-white">{page.title}</p>
                    </td>
                    <td className="py-4 px-6">
                      <code className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        /{page.slug}
                      </code>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {page.authorId || 'Admin'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={clsx(
                        "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                        page.status === 'published' 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      )}>
                        {page.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {formatDate(page.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {socialStyleLargeNumbers(page.views)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {page.status === 'published' && (
                          <a
                            href={getFullUrl(page.slug, 'page')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Live"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(page)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {((currentPageNum - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPageNum * ITEMS_PER_PAGE, filteredPages.length)} of {filteredPages.length} pages
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                  disabled={currentPageNum === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPageNum(pageNum)}
                    className={clsx(
                      "w-10 h-10 rounded-lg font-medium transition-colors",
                      pageNum === currentPageNum
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPageNum(Math.min(totalPages, currentPageNum + 1))}
                  disabled={currentPageNum === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </NeumorphBox>
  );
}
