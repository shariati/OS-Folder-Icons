'use client';

import { useState } from 'react';
import { DB } from '@/lib/types';
import { OSManager } from '@/components/OSManager';
import { BundlesManager } from '@/components/BundlesManager';
import { ToastProvider } from '@/components/Toast';
import { clsx } from 'clsx';

export default function AdminPage({ initialData }: { initialData: DB }) {
  const [activeTab, setActiveTab] = useState<'os' | 'bundles'>('os');

  return (
    <ToastProvider>
      <div className="space-y-8">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
          <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage Operating Systems, Versions, Folder Assets, and Bundles.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('os')}
              className={clsx(
                "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === 'os'
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              Operating Systems
            </button>
            <button
              onClick={() => setActiveTab('bundles')}
              className={clsx(
                "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === 'bundles'
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              Bundles
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
          {activeTab === 'os' ? (
            <OSManager initialData={initialData} />
          ) : (
            <BundlesManager initialData={initialData} />
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
