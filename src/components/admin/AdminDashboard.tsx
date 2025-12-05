'use client';

import { useState } from 'react';
import { DB } from '@/lib/types';
import { OSManager } from '@/components/admin/OSManager';
import { BundlesManager } from '@/components/admin/BundlesManager';
import { ToastProvider } from '@/components/ui/Toast';
import { CategoriesManager } from '@/components/admin/CategoriesManager';
import { TagsManager } from '@/components/admin/TagsManager';
import { HeroManager } from '@/components/admin/HeroManager';
import { UsersManager } from '@/components/admin/UsersManager';
import { AnalyticsManager } from '@/components/admin/AnalyticsManager';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { BlogManager } from '@/components/admin/BlogManager';
import { PagesManager } from '@/components/admin/PagesManager';
import { IconGenerator } from '@/components/features/IconGenerator';
import { PhotoFrameGenerator } from '@/components/features/PhotoFrameGenerator';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminDashboard({ initialData }: { initialData: DB }) {
  const [activeTab, setActiveTab] = useState<'os' | 'bundles' | 'categories' | 'tags' | 'hero' | 'users' | 'analytics' | 'audit' | 'blog' | 'pages' | 'folder-icon' | 'photo-frame'>('os');

  return (
    <ToastProvider>
      <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            {activeTab === 'os' && 'Operating Systems'}
            {activeTab === 'bundles' && 'Bundle Management'}
            {activeTab === 'categories' && 'Categories'}
            {activeTab === 'tags' && 'Tags'}
            {activeTab === 'hero' && 'Hero Slider'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'audit' && 'Audit Log'}
            {activeTab === 'blog' && 'Blog Posts'}
            {activeTab === 'pages' && 'Pages'}
            {activeTab === 'folder-icon' && 'Folder Icon Generator'}
            {activeTab === 'photo-frame' && 'Photo Frame'}
          </h2>

          <nav>
            <ol className="flex items-center gap-2">
              <li>
                <a className="font-medium" href="/admin">
                  Dashboard /
                </a>
              </li>
              <li className="font-medium text-primary">
                {activeTab === 'os' && 'OS'}
                {activeTab === 'bundles' && 'Bundles'}
                {activeTab === 'categories' && 'Categories'}
                {activeTab === 'tags' && 'Tags'}
                {activeTab === 'hero' && 'Hero'}
                {activeTab === 'users' && 'Users'}
                {activeTab === 'analytics' && 'Analytics'}
                {activeTab === 'audit' && 'Audit'}
                {activeTab === 'blog' && 'Blog'}
                {activeTab === 'pages' && 'Pages'}
                {activeTab === 'folder-icon' && 'Folder Icon'}
                {activeTab === 'photo-frame' && 'Photo Frame'}
              </li>
            </ol>
          </nav>
        </div>

        <div className="flex flex-col gap-10">
          {activeTab === 'os' && <OSManager initialData={initialData} />}
          {activeTab === 'bundles' && <BundlesManager initialData={initialData} />}
          {activeTab === 'categories' && <CategoriesManager initialData={initialData} />}
          {activeTab === 'tags' && <TagsManager initialData={initialData} />}
          {activeTab === 'hero' && <HeroManager initialData={initialData} />}
          {activeTab === 'users' && <UsersManager initialData={initialData} />}
          {activeTab === 'analytics' && <AnalyticsManager initialData={initialData} />}
          {activeTab === 'audit' && <AuditLogViewer initialData={initialData} />}
          {activeTab === 'blog' && <BlogManager initialData={initialData} />}
          {activeTab === 'pages' && <PagesManager initialData={initialData} />}
          {activeTab === 'folder-icon' && <IconGenerator initialData={initialData} isAdmin={true} />}
          {activeTab === 'photo-frame' && <PhotoFrameGenerator />}
        </div>
      </AdminLayout>
    </ToastProvider>
  );
}
