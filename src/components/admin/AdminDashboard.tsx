'use client';

import { useState } from 'react';

import { BlogManager } from '@/components/admin/BlogManager';
import { BundlesManager } from '@/components/admin/BundlesManager';
import { CategoriesManager } from '@/components/admin/CategoriesManager';
import { HeroManager } from '@/components/admin/HeroManager';
import { MonetizationManager } from '@/components/admin/MonetizationManager';
import { OSManager } from '@/components/admin/OSManager';
import { PagesManager } from '@/components/admin/PagesManager';
import { PhotoFrameManager } from '@/components/admin/PhotoFrameManager';
import { SiteConfigManager } from '@/components/admin/SiteConfigManager';
import { TagsManager } from '@/components/admin/TagsManager';
import { UsersManager } from '@/components/admin/UsersManager';
import AdminLayout from '@/components/layout/AdminLayout';
import { ToastProvider } from '@/components/ui/Toast';
import { DB } from '@/lib/types';

export default function AdminDashboard({ initialData }: { initialData: DB }) {
  const [activeTab, setActiveTab] = useState<
    | 'os'
    | 'bundles'
    | 'categories'
    | 'tags'
    | 'hero'
    | 'users'
    | 'blog'
    | 'pages'
    | 'ads'
    | 'settings'
    | 'photo-frame'
  >('os');

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

            {activeTab === 'blog' && 'Site Manager / Blog Posts'}
            {activeTab === 'pages' && 'Site Manager / Pages'}
            {activeTab === 'ads' && 'Monetization'}
            {activeTab === 'settings' && 'Site Manager / Site Configuration'}
            {activeTab === 'photo-frame' && 'Photo Frame / Settings'}
          </h2>

          <nav>
            <ol className="flex items-center gap-2">
              <li>
                <a className="font-medium" href="/admin">
                  Dashboard /
                </a>
              </li>
              <li className="text-primary font-medium">
                {activeTab === 'os' && 'Folder Icon / OS'}
                {activeTab === 'bundles' && 'Folder Icon / Bundles'}
                {activeTab === 'categories' && 'Site Manager / Categories'}
                {activeTab === 'tags' && 'Site Manager / Tags'}
                {activeTab === 'hero' && 'Site Manager / Hero'}
                {activeTab === 'users' && 'Users'}

                {activeTab === 'blog' && 'Site Manager / Blog'}
                {activeTab === 'pages' && 'Site Manager / Pages'}
                {activeTab === 'ads' && 'Ads'}
                {activeTab === 'settings' && 'Site Manager / Settings'}
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

          {activeTab === 'blog' && <BlogManager initialData={initialData} />}
          {activeTab === 'pages' && <PagesManager initialData={initialData} />}
          {activeTab === 'ads' && <MonetizationManager />}
          {activeTab === 'settings' && <SiteConfigManager />}
          {activeTab === 'photo-frame' && <PhotoFrameManager />}
        </div>
      </AdminLayout>
    </ToastProvider>
  );
}
