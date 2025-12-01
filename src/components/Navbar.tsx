import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-4 left-4 right-4 z-50 rounded-2xl glass-panel border border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-700 dark:text-white hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <span className="hidden sm:block">OS Folder Icons</span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link href="/" className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all">
                Home
              </Link>
              <Link href="/bundles" className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all">
                Bundles
              </Link>
              <Link href="/admin" className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all">
                Admin
              </Link>
            </div>
          </div>
          <div className="flex items-center">
             <Link href="/" className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium rounded-xl text-white bg-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200">
                Get Started
             </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
