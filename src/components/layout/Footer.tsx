import { BookOpen, Github, Linkedin, Palette } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import {
  FIREBASE_STORAGE,
  getFirebaseStorageUrl,
  RESOURCE_LINKS,
  SOCIAL_LINKS,
} from '@/constants/links';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/20 bg-gray-100/50 pb-8 pt-16 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link
              href="/"
              className="flex items-center text-xl font-bold text-gray-700 dark:text-white"
            >
              <Image
                src={getFirebaseStorageUrl(FIREBASE_STORAGE.LOGO)}
                alt="HD Pick"
                width={56}
                height={56}
                className="h-32 w-32"
              />
            </Link>
            <p className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              Personalize every pixel
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Beautiful, customizable folder icons for your digital workspace. Designed with love
              and pixel-perfect precision.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href={SOCIAL_LINKS.GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all duration-200 hover:text-gray-900 hover:shadow-md dark:bg-gray-800 dark:hover:text-white"
              >
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all duration-200 hover:text-blue-600 hover:shadow-md dark:bg-gray-800"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.BEHANCE}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all duration-200 hover:text-blue-500 hover:shadow-md dark:bg-gray-800"
              >
                <span className="sr-only">Behance</span>
                <Palette className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.MEDIUM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all duration-200 hover:text-black hover:shadow-md dark:bg-gray-800 dark:hover:text-white"
              >
                <span className="sr-only">Medium</span>
                <BookOpen className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/bundles"
                  className="text-base text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Bundles
                </Link>
              </li>
              <li>
                <Link
                  href="/custom-folders"
                  className="text-base text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Custom Folders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={RESOURCE_LINKS.FONTAWESOME}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Font Awesome
                </a>
              </li>
              <li>
                <a
                  href={RESOURCE_LINKS.LUCIDE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Lucide Icons
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-base text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-base text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-base text-gray-400">
              &copy;{new Date().getFullYear()} HDPick. All rights reserved.
            </p>
            <nav className="flex flex-wrap justify-center gap-x-2 gap-y-3 text-sm text-gray-500 dark:text-gray-400">
              <Link
                href="/privacy"
                className="px-2 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link
                href="/terms"
                className="px-2 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Terms of Use
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link
                href="/sitemap"
                className="px-2 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Site Map
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link
                href="/cookies"
                className="px-2 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Manage Cookies
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link
                href="/do-not-sell"
                className="px-2 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Do Not Sell My Personal Information
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
