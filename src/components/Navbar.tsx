import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white">
                <FolderOpen className="w-8 h-8 text-blue-600" />
                <span>OS Folder Icons</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600">
                Home
              </Link>
              <Link href="/bundles" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                Bundles
              </Link>
              <Link href="/admin" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
