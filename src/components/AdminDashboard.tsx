'use client';

import { useState } from 'react';
import { DB } from '@/lib/types';
import { OSManager } from '@/components/OSManager';
import { BundlesManager } from '@/components/BundlesManager';
import { ToastProvider } from '@/components/Toast';
import { clsx } from 'clsx';
import { LayoutDashboard, Package, Settings, LogOut, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard({ initialData }: { initialData: DB }) {
  const [activeTab, setActiveTab] = useState<'os' | 'bundles'>('os');

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col fixed h-full z-10">
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/" className="flex items-center space-x-2 font-bold text-gray-900 dark:text-white">
              <FolderOpen className="w-6 h-6 text-blue-600" />
              <span>Admin Panel</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('os')}
                className={clsx(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeTab === 'os'
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Operating Systems
              </button>
              <button
                onClick={() => setActiveTab('bundles')}
                className={clsx(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeTab === 'bundles'
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <Package className="w-5 h-5 mr-3" />
                Bundles
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <LogOut className="w-5 h-5 mr-3" />
              Back to Site
            </Link>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-20">
           <Link href="/" className="flex items-center space-x-2 font-bold text-gray-900 dark:text-white">
              <FolderOpen className="w-6 h-6 text-blue-600" />
              <span>Admin</span>
            </Link>
            <div className="flex gap-2">
               <button onClick={() => setActiveTab('os')} className={`p-2 rounded-md ${activeTab === 'os' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
                  <LayoutDashboard className="w-5 h-5" />
               </button>
               <button onClick={() => setActiveTab('bundles')} className={`p-2 rounded-md ${activeTab === 'bundles' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
                  <Package className="w-5 h-5" />
               </button>
            </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-8 pt-24 md:pt-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'os' ? 'Operating Systems Management' : 'Bundle Management'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {activeTab === 'os' 
                  ? 'Manage OS versions, folder assets, and configurations.' 
                  : 'Create and manage icon bundles for the marketplace.'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 min-h-[600px] p-6">
              {activeTab === 'os' ? (
                <OSManager initialData={initialData} />
              ) : (
                <BundlesManager initialData={initialData} />
              )}
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
