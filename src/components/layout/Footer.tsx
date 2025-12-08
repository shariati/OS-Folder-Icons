import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, Linkedin, Palette, BookOpen } from 'lucide-react';
import { SOCIAL_LINKS, RESOURCE_LINKS, getFirebaseStorageUrl, FIREBASE_STORAGE } from '@/constants/links';

export function Footer() {
  return (
    <footer className="mt-20 pt-16 pb-8 bg-gray-100/50 dark:bg-gray-900/50 border-t border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center text-xl font-bold text-gray-700 dark:text-white">
              <Image
                src={getFirebaseStorageUrl(FIREBASE_STORAGE.LOGO)}
                alt="HD Pick"
                width={56}
                height={56}
                className="w-32 h-32"
              />
            </Link>
            <p className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              Personalize every pixel
            </p>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Beautiful, customizable folder icons for your digital workspace. Designed with love and pixel-perfect precision.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href={SOCIAL_LINKS.GITHUB} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-200">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
              <a href={SOCIAL_LINKS.LINKEDIN} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a href={SOCIAL_LINKS.BEHANCE} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-blue-500 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="sr-only">Behance</span>
                <Palette className="h-5 w-5" />
              </a>
              <a href={SOCIAL_LINKS.MEDIUM} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-200">
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
                <Link href="/create" className="text-base text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Custom Folders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href={RESOURCE_LINKS.FONTAWESOME} target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Font Awesome
                </a>
              </li>
              <li>
                <a href={RESOURCE_LINKS.LUCIDE} target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Lucide Icons
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Documentation
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
          <div className="flex flex-col items-center space-y-4">
            <p className="text-base text-gray-400 text-center">
              &copy;{new Date().getFullYear()} HDPick. All rights reserved.
            </p>
            <nav className="flex flex-wrap justify-center gap-x-2 gap-y-3 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/privacy" className="px-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link href="/terms" className="px-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms of Use
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link href="/sitemap" className="px-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Site Map
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link href="/cookies" className="px-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Manage Cookies
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link href="/do-not-sell" className="px-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Do Not Sell My Personal Information
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
