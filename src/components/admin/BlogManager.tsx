'use client';

import clsx from 'clsx';
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  ExternalLink,
  Newspaper,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { deleteBlogPostAction, saveBlogPostAction } from '@/app/admin/actions';
import { EmptyState } from '@/components/admin/EmptyState';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { useToast } from '@/components/ui/Toast';
import { socialStyleLargeNumbers } from '@/lib/format';
import { formatDate } from '@/lib/format';
import { BlogPost, DB, Tag } from '@/lib/types';
import { getFullUrl } from '@/lib/url';

import { BlogEditor } from './BlogEditor';

interface BlogManagerProps {
  initialData: DB;
}

const ITEMS_PER_PAGE = 10;

export function BlogManager({ initialData }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialData.blogPosts || []);
  const [tags, setTags] = useState<Tag[]>(initialData.tags || []);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'scheduled'>(
    'all'
  );
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const { showToast } = useToast();

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
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
      setPosts(posts.filter((p) => p.id !== id));
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
      const existingIndex = posts.findIndex((p) => p.id === postToSave.id);
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

  const formatDateForAdmin = (dateString?: string) => formatDate(dateString, 'LONG_ABBR');

  const handleCreateTag = async (name: string): Promise<Tag> => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    const newTag: Tag = { id: Date.now().toString(), name, slug };

    const response = await fetch('/api/admin/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTag),
    });

    if (!response.ok) throw new Error('Failed to create tag');
    const savedTag = await response.json();
    setTags([...tags, savedTag]);
    return savedTag;
  };

  if (isEditing) {
    return (
      <div className="flex h-full flex-col">
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
            availableTags={tags}
            onCreateTag={handleCreateTag}
          />
        </div>
      </div>
    );
  }

  return (
    <NeumorphBox className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white">
          <Newspaper size={24} className="text-primary" />
          Blog Management
        </h3>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          New Post
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row">
        <div className="flex flex-wrap gap-2">
          {(['all', 'draft', 'published', 'scheduled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPageNum(1);
              }}
              className={clsx(
                'rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all',
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPageNum(1);
            }}
            className="focus:border-primary w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 outline-none transition dark:border-gray-700 dark:bg-gray-800"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Table */}
      {filteredPosts.length === 0 ? (
        <EmptyState
          title="No posts found"
          description={
            searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Create your first blog post to get started.'
          }
          actionLabel={!searchTerm && statusFilter === 'all' ? 'Create Post' : undefined}
          onAction={!searchTerm && statusFilter === 'all' ? handleCreateNew : undefined}
        />
      ) : (
        <>
          <div className="max-w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-left dark:bg-gray-800">
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Title
                  </th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Author
                  </th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Created
                  </th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Published
                  </th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Views
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {paginatedPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-black dark:text-white">{post.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        /blog/{post.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {post.authorId || 'Admin'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          'rounded-full px-2.5 py-0.5 text-xs font-bold uppercase',
                          post.status === 'published'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : post.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        )}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDateForAdmin(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDateForAdmin(post.publishedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {socialStyleLargeNumbers(post.views)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'published' && (
                          <a
                            href={getFullUrl(post.slug, 'blog')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            title="View Live"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(post)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
                Showing {(currentPageNum - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPageNum * ITEMS_PER_PAGE, filteredPosts.length)} of{' '}
                {filteredPosts.length} posts
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                  disabled={currentPageNum === 1}
                  className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPageNum(pageNum)}
                    className={clsx(
                      'h-10 w-10 rounded-lg font-medium transition-colors',
                      pageNum === currentPageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPageNum(Math.min(totalPages, currentPageNum + 1))}
                  disabled={currentPageNum === totalPages}
                  className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
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
