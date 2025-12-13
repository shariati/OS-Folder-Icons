'use client';

import Link from 'next/link';

import { Footer } from '@/components/layout/Footer';
import { NeumorphBox } from '@/components/ui/NeumorphBox';

const siteStructure = [
  {
    category: 'Main',
    links: [
      { name: 'Home', href: '/' },
      { name: 'Bundles', href: '/bundles' },
      { name: 'Custom Folders', href: '/custom-folders' },
      { name: 'Photo Frame', href: '/photo-frame' },
      { name: 'Blog', href: '/blog' },
    ],
  },
  {
    category: 'Account',
    links: [
      { name: 'Login', href: '/login' },
      { name: 'Sign Up', href: '/signup' },
      { name: 'My Profile', href: '/profile' },
    ],
  },
  {
    category: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Use', href: '/terms' },
      { name: 'Manage Cookies', href: '/cookies' },
      { name: 'Do Not Sell My Personal Information', href: '/do-not-sell' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#e0e5ec] dark:bg-gray-900">
      <div className="flex-grow px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <NeumorphBox className="rounded-3xl bg-white p-8 shadow-xl md:p-12 dark:bg-gray-800">
            <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">Site Map</h1>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {siteStructure.map((section) => (
                <div key={section.category}>
                  <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                    {section.category}
                  </h2>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </NeumorphBox>
        </div>
      </div>
      <Footer />
    </div>
  );
}
