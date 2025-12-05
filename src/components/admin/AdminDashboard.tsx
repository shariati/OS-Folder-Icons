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
import { PhotoFrameGenerator } from '@/components/features/PhotoFrameGenerator';
import { AdSettings } from '@/components/admin/AdSettings';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminDashboard({ initialData }: { initialData: DB }) {
  const [activeTab, setActiveTab] = useState<'os' | 'bundles' | 'categories' | 'tags' | 'hero' | 'users' | 'analytics' | 'audit' | 'blog' | 'pages' | 'photo-frame' | 'ads'>('os');

  return (
    <ToastProvider>
      <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            {activeTab === 'os' && 'Folder Icon / Operating Systems'}
            {activeTab === 'bundles' && 'Folder Icon / Bundle Management'}
            {activeTab === 'categories' && 'Site Manager / Categories'}
            {activeTab === 'tags' && 'Site Manager / Tags'}
            {activeTab === 'hero' && 'Site Manager / Hero Slider'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'audit' && 'Audit Log'}
            {activeTab === 'blog' && 'Site Manager / Site Content / Blog Posts'}
            {activeTab === 'pages' && 'Site Manager / Site Content / Pages'}
            {activeTab === 'photo-frame' && 'Photo Frame'}
            {activeTab === 'ads' && 'Monetization'}
          </h2>

          <nav>
            <ol className="flex items-center gap-2">
              <li>
                <a className="font-medium" href="/admin">
                  Dashboard /
                </a>
              </li>
              <li className="font-medium text-primary">
                {activeTab === 'os' && 'Folder Icon / OS'}
                {activeTab === 'bundles' && 'Folder Icon / Bundles'}
                {activeTab === 'categories' && 'Site Manager / Categories'}
                {activeTab === 'tags' && 'Site Manager / Tags'}
                {activeTab === 'hero' && 'Site Manager / Hero'}
                {activeTab === 'users' && 'Users'}
                {activeTab === 'analytics' && 'Analytics'}
                {activeTab === 'audit' && 'Audit'}
                {activeTab === 'blog' && 'Site Manager / Content / Blog'}
                {activeTab === 'pages' && 'Site Manager / Content / Pages'}
                {activeTab === 'photo-frame' && 'Photo Frame'}
                {activeTab === 'ads' && 'Ads'}
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
          {activeTab === 'photo-frame' && <PhotoFrameGenerator />}
          {activeTab === 'ads' && <AdSettings />}
        </div>
      </AdminLayout>
    </ToastProvider>
  );
}
