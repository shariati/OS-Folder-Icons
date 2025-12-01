'use client';

import { useState } from 'react';
import { DB } from '@/lib/types';
import { OSManager } from '@/components/OSManager';
import { BundlesManager } from '@/components/BundlesManager';
import { ToastProvider } from '@/components/Toast';
import { clsx } from 'clsx';
import { CategoriesManager } from '@/components/CategoriesManager';
import { TagsManager } from '@/components/TagsManager';
import { LayoutDashboard, Package, Settings, LogOut, FolderOpen, Tags, Grid } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard({ initialData }: { initialData: DB }) {
  const [activeTab, setActiveTab] = useState<'os' | 'bundles' | 'categories' | 'tags'>('os');

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#e0e5ec] dark:bg-gray-900 flex">
        {/* Sidebar */}
        <aside className="w-72 bg-[#e0e5ec] dark:bg-gray-950 hidden md:flex flex-col fixed h-full z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="h-24 flex items-center px-8">
            <Link href="/" className="flex items-center space-x-3 font-bold text-gray-800 dark:text-white group">
              <div className="w-10 h-10 rounded-xl neu-flat group-hover:neu-pressed flex items-center justify-center text-blue-600 transition-all">
                <FolderOpen className="w-5 h-5" />
              </div>
              <span className="text-lg">Admin Panel</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-6">
            <nav className="space-y-4">
              <button
                onClick={() => setActiveTab('os')}
                className={clsx(
                  "w-full flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all duration-200",
                  activeTab === 'os'
                    ? "neu-pressed text-blue-600"
                    : "neu-flat hover:neu-pressed text-gray-600 dark:text-gray-300"
                )}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Operating Systems
              </button>
              <button
                onClick={() => setActiveTab('bundles')}
                className={clsx(
                  "w-full flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all duration-200",
                  activeTab === 'bundles'
                    ? "neu-pressed text-blue-600"
                    : "neu-flat hover:neu-pressed text-gray-600 dark:text-gray-300"
                )}
              >
                <Package className="w-5 h-5 mr-3" />
                Bundles
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={clsx(
                  "w-full flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all duration-200",
                  activeTab === 'categories'
                    ? "neu-pressed text-blue-600"
                    : "neu-flat hover:neu-pressed text-gray-600 dark:text-gray-300"
                )}
              >
                <Grid className="w-5 h-5 mr-3" />
                Categories
              </button>
              <button
                onClick={() => setActiveTab('tags')}
                className={clsx(
                  "w-full flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all duration-200",
                  activeTab === 'tags'
                    ? "neu-pressed text-blue-600"
                    : "neu-flat hover:neu-pressed text-gray-600 dark:text-gray-300"
                )}
              >
                <Tags className="w-5 h-5 mr-3" />
                Tags
              </button>
            </nav>
          </div>

          <div className="p-6">
            <Link href="/" className="flex items-center justify-center px-4 py-4 text-sm font-bold text-gray-600 hover:text-red-500 neu-flat hover:neu-pressed rounded-2xl transition-all">
              <LogOut className="w-5 h-5 mr-2" />
              Back to Site
            </Link>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#e0e5ec] dark:bg-gray-950 flex items-center justify-between px-4 z-20 shadow-sm">
           <Link href="/" className="flex items-center space-x-2 font-bold text-gray-900 dark:text-white">
              <FolderOpen className="w-6 h-6 text-blue-600" />
              <span>Admin</span>
            </Link>
            <div className="flex gap-2">
               <button onClick={() => setActiveTab('os')} className={clsx("p-2 rounded-xl transition-all", activeTab === 'os' ? 'neu-pressed text-blue-600' : 'neu-flat text-gray-500')}>
                  <LayoutDashboard className="w-5 h-5" />
               </button>
               <button onClick={() => setActiveTab('bundles')} className={clsx("p-2 rounded-xl transition-all", activeTab === 'bundles' ? 'neu-pressed text-blue-600' : 'neu-flat text-gray-500')}>
                  <Package className="w-5 h-5" />
               </button>
               <button onClick={() => setActiveTab('categories')} className={clsx("p-2 rounded-xl transition-all", activeTab === 'categories' ? 'neu-pressed text-blue-600' : 'neu-flat text-gray-500')}>
                  <Grid className="w-5 h-5" />
               </button>
               <button onClick={() => setActiveTab('tags')} className={clsx("p-2 rounded-xl transition-all", activeTab === 'tags' ? 'neu-pressed text-blue-600' : 'neu-flat text-gray-500')}>
                  <Tags className="w-5 h-5" />
               </button>
            </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 md:ml-72 p-6 md:p-12 pt-24 md:pt-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {activeTab === 'os' && 'Operating Systems'}
                {activeTab === 'bundles' && 'Bundle Management'}
                {activeTab === 'categories' && 'Categories'}
                {activeTab === 'tags' && 'Tags'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                {activeTab === 'os' && 'Manage OS versions, folder assets, and configurations.'}
                {activeTab === 'bundles' && 'Create and manage icon bundles for the marketplace.'}
                {activeTab === 'categories' && 'Manage product categories and SEO settings.'}
                {activeTab === 'tags' && 'Manage tags for bundles and search.'}
              </p>
            </div>

            <div className="neu-flat rounded-3xl min-h-[600px] p-8">
              {activeTab === 'os' && <OSManager initialData={initialData} />}
              {activeTab === 'bundles' && <BundlesManager initialData={initialData} />}
              {activeTab === 'categories' && <CategoriesManager initialData={initialData} />}
              {activeTab === 'tags' && <TagsManager initialData={initialData} />}
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
