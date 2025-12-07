'use client';

import { useState } from 'react';
import { DB, BlogPost } from '@/lib/types';
import { saveBlogPostAction, deleteBlogPostAction } from '@/app/admin/actions';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit, Trash2, ExternalLink, Calendar, Eye } from 'lucide-react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { EmptyState } from '@/components/admin/EmptyState';
import { BlogEditor } from './BlogEditor';
import { getFullUrl } from '@/lib/url';

interface BlogManagerProps {
  initialData: DB;
}

export function BlogManager({ initialData }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialData.blogPosts || []);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const hasItems = posts.length > 0;

  const handleCreateNew = () => {
    setCurrentPost({
      id: Date.now().toString(),
      status: 'draft',
      published: false,
      authorId: 'admin', // Hardcoded for now
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
      // We set published=true for scheduled posts too, so they satisfy naive checks,
      // but we will filter by date in the public view to ensure they don't appear early.
      postToSave.published = postToSave.status === 'published' || postToSave.status === 'scheduled';

      // Ensure creation date
      if (!postToSave.createdAt) {
          postToSave.createdAt = new Date().toISOString();
      }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage your blog content</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      {!hasItems ? (
        <EmptyState
          title="No blog posts yet"
          description="Create your first blog post to start sharing your thoughts."
          actionLabel="Create Post"
          onAction={handleCreateNew}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .map((post) => (
            <NeumorphBox 
                key={post.id}
                title={post.title}
                subtitle={
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 font-mono">/blog/{post.slug}</span>
                    {post.status === 'published' && (
                        <a 
                            href={getFullUrl(post.slug, 'blog')} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                        >
                            <ExternalLink size={12} />
                        </a>
                    )}
                  </div>
                }
                showActions
                onEdit={() => handleEdit(post)}
                onDelete={() => handleDelete(post.id)}
                badge={
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    post.status === 'published' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : post.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                    {post.status || (post.published ? 'Published' : 'Draft')}
                </span>
                }
            >
                <div className="mt-2 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>
                        {post.publishedAt 
                            ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
                            : 'Unscheduled'}
                    </span>
                  </div>
                  {post.views !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Eye size={14} />
                        <span>{post.views} views</span>
                      </div>
                  )}
                  {post.readingTime && (
                    <span>{post.readingTime} min read</span>
                  )}
                </div>
            </NeumorphBox>
          ))}
        </div>
      )}
    </div>
  );
}
