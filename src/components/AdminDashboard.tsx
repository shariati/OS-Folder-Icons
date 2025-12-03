'use client';

import { useState } from 'react';
import { DB } from '@/lib/types';
import { OSManager } from '@/components/OSManager';
import { BundlesManager } from '@/components/BundlesManager';
import { ToastProvider } from '@/components/Toast';
import { CategoriesManager } from '@/components/CategoriesManager';
import { TagsManager } from '@/components/TagsManager';
import { HeroManager } from '@/components/HeroManager';
import { UsersManager } from '@/components/UsersManager';
import { AnalyticsManager } from '@/components/AnalyticsManager';
import { AuditLogViewer } from '@/components/AuditLogViewer';
import { BlogManager } from '@/components/BlogManager';
import { PagesManager } from '@/components/PagesManager';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboard({ initialData }: { initialData: DB }) {
  const [activeTab, setActiveTab] = useState<'os' | 'bundles' | 'categories' | 'tags' | 'hero' | 'users' | 'analytics' | 'audit' | 'blog' | 'pages'>('os');

  return (
    <ToastProvider>
      <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            {activeTab === 'os' && 'Operating Systems'}
            {activeTab === 'bundles' && 'Bundle Management'}
            {activeTab === 'categories' && 'Categories'}
            {activeTab === 'tags' && 'Tags'}
            {activeTab === 'tags' && 'Tags'}
            {activeTab === 'hero' && 'Hero Slider'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'audit' && 'Audit Log'}
            {activeTab === 'blog' && 'Blog Posts'}
            {activeTab === 'pages' && 'Pages'}
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
                {activeTab === 'tags' && 'Tags'}
                {activeTab === 'hero' && 'Hero'}
                {activeTab === 'users' && 'Users'}
                {activeTab === 'analytics' && 'Analytics'}
                {activeTab === 'audit' && 'Audit'}
                {activeTab === 'blog' && 'Blog'}
                {activeTab === 'pages' && 'Pages'}
              </li>
            </ol>
          </nav>
        </div>

        <div className="flex flex-col gap-10">
          {activeTab === 'os' && <OSManager initialData={initialData} />}
          {activeTab === 'bundles' && <BundlesManager initialData={initialData} />}
          {activeTab === 'categories' && <CategoriesManager initialData={initialData} />}
          {activeTab === 'tags' && <TagsManager initialData={initialData} />}
          {activeTab === 'tags' && <TagsManager initialData={initialData} />}
          {activeTab === 'hero' && <HeroManager initialData={initialData} />}
          {activeTab === 'users' && <UsersManager initialData={initialData} />}
          {activeTab === 'analytics' && <AnalyticsManager initialData={initialData} />}
          {activeTab === 'audit' && <AuditLogViewer initialData={initialData} />}
          {activeTab === 'blog' && <BlogManager initialData={initialData} />}
          {activeTab === 'pages' && <PagesManager initialData={initialData} />}
        </div>
      </AdminLayout>
    </ToastProvider>
  );
}
