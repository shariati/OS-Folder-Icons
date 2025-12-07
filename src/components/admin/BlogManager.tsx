'use client';

import { useState, useMemo } from 'react';
import { DB, BlogPost } from '@/lib/types';
import { saveBlogPostAction, deleteBlogPostAction } from '@/app/admin/actions';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, Newspaper, Edit2, Trash2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { EmptyState } from '@/components/admin/EmptyState';
import { BlogEditor } from './BlogEditor';
import { getFullUrl } from '@/lib/url';
import { socialStyleLargeNumbers } from '@/lib/format';
import clsx from 'clsx';

interface BlogManagerProps {
  initialData: DB;
}

const ITEMS_PER_PAGE = 10;

export function BlogManager({ initialData }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialData.blogPosts || []);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'scheduled'>('all');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const { showToast } = useToast();

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    return posts
      .filter(post => {
        const matchesSearch = 
          post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.authorId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [posts, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPageNum - 1) * ITEMS_PER_PAGE,
    currentPageNum * ITEMS_PER_PAGE
  );

  const handleCreateNew = () => {
    setCurrentPost({
      id: Date.now().toString(),
      status: 'draft',
      published: false,
      authorId: 'admin',
      tags: [],
    });
    setIsEditing(true);
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      setIsLoading(true);
      await deleteBlogPostAction(id);
      setPosts(posts.filter(p => p.id !== id));
      showToast('Post deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Failed to delete post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPost.title || !currentPost.slug) {
      showToast('Title and Slug are required', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const postToSave = currentPost as BlogPost;
      
      // Sync published boolean with status for backward compatibility
      postToSave.published = postToSave.status === 'published' || postToSave.status === 'scheduled';

      // Ensure creation date
      if (!postToSave.createdAt) {
          postToSave.createdAt = new Date().toISOString();
      }
      postToSave.updatedAt = new Date().toISOString();

      await saveBlogPostAction(postToSave);
      
      // Update local state
      const existingIndex = posts.findIndex(p => p.id === postToSave.id);
      if (existingIndex !== -1) {
        const newPosts = [...posts];
        newPosts[existingIndex] = postToSave;
        setPosts(newPosts);
      } else {
        setPosts([postToSave, ...posts]);
      }

      setIsEditing(false);
      showToast('Post saved successfully', 'success');
    } catch (error) {
      console.error('Error saving post:', error);
      showToast('Failed to save post', 'error');
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
                &larr; Back to Posts
            </button>
        </div>
        <div className="flex-1 overflow-hidden">
            <BlogEditor
              post={currentPost}
              onChange={setCurrentPost}
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
          <Newspaper size={24} className="text-primary" />
          Blog Management
        </h3>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={18} />
          New Post
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'draft', 'published', 'scheduled'] as const).map(status => (
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
            placeholder="Search by title, slug, or author..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPageNum(1); }}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-800"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Table */}
      {filteredPosts.length === 0 ? (
        <EmptyState
          title="No posts found"
          description={searchTerm || statusFilter !== 'all' ? "Try adjusting your search or filters." : "Create your first blog post to get started."}
          actionLabel={!searchTerm && statusFilter === 'all' ? "Create Post" : undefined}
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
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Published</th>
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Views</th>
                  <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {paginatedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-black dark:text-white">{post.title}</p>
                    </td>
                    <td className="py-4 px-6">
                      <code className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        /blog/{post.slug}
                      </code>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {post.authorId || 'Admin'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={clsx(
                        "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                        post.status === 'published' 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : post.status === 'scheduled'
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      )}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {socialStyleLargeNumbers(post.views)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'published' && (
                          <a
                            href={getFullUrl(post.slug, 'blog')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Live"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
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
                Showing {((currentPageNum - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPageNum * ITEMS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} posts
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
