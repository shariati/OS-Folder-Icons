import Link from 'next/link';
import { FolderOpen, Twitter, Github, Linkedin, Palette, BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 pt-16 pb-8 bg-gray-100/50 dark:bg-gray-900/50 border-t border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-700 dark:text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <span>OS Folder Icons</span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Beautiful, customizable folder icons for your digital workspace. Designed with love and pixel-perfect precision.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="https://github.com/shariati/OS-Folder-Icons" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-200">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/aminshariati" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.behance.net/aminshariati?" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-blue-500 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="sr-only">Behance</span>
                <Palette className="h-5 w-5" />
              </a>
              <a href="https://medium.com/@shariati" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-200">
                <span className="sr-only">Medium</span>
                <BookOpen className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/bundles" className="text-base text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Bundles
                </Link>
              </li>
              <li>
                <Link href="/" className="text-base text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Icon Generator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-base text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} OS Folder Icons. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
