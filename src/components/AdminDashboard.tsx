'use client';

import { useState } from 'react';
import { DB } from '@/lib/types';
import { OSManager } from '@/components/OSManager';
import { BundlesManager } from '@/components/BundlesManager';
import { ToastProvider } from '@/components/Toast';
import { CategoriesManager } from '@/components/CategoriesManager';
import { TagsManager } from '@/components/TagsManager';
import { HeroManager } from '@/components/HeroManager';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboard({ initialData }: { initialData: DB }) {
  const [activeTab, setActiveTab] = useState<'os' | 'bundles' | 'categories' | 'tags' | 'hero'>('os');

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
        </div>
      </AdminLayout>
    </ToastProvider>
  );
}
