import { getDB } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Download, Search, Filter } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { NeumorphBox } from '@/components/ui/NeumorphBox';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Icon Bundles - HDPick',
  description:
    'Browse and download curated collections of folder icons for macOS, Windows, and Linux. Find the perfect style for your desktop.',
};

export default async function BundlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const db = await getDB();
  const { category, q } = await searchParams;

  let bundles = db.bundles;

  // Simple filtering (in a real app, this might be DB-side or more robust)
  if (category) {
    bundles = bundles.filter((b) => b.tags.some((t) => t.toLowerCase() === category.toLowerCase()));
  }
  if (q) {
    bundles = bundles.filter((b) => b.name.toLowerCase().includes(q.toLowerCase()));
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#e0e5ec] dark:bg-gray-900">
      <div className="pb-12 pt-32">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl dark:text-white">
            Explore Collections
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-gray-500 dark:text-gray-400">
            Discover hand-picked icon bundles to personalize your operating system.
          </p>

          {/* Search and Filter Bar */}
          <div className="mx-auto flex max-w-3xl gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <NeumorphBox
                as="input"
                variant="pressed"
                type="text"
                placeholder="Search bundles..."
                className="w-full rounded-2xl bg-transparent py-4 pl-14 pr-6 text-gray-700 outline-none transition-all focus:ring-2 focus:ring-blue-500/50 dark:text-white"
              />
            </div>
            <NeumorphBox
              as="button"
              className="hover:neu-pressed flex items-center gap-3 rounded-2xl px-8 py-4 font-bold text-gray-700 transition-all dark:text-gray-200"
            >
              <Filter className="h-5 w-5" />
              Filters
            </NeumorphBox>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-12 sm:px-6 lg:px-8">
        {bundles.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {bundles.map((bundle) => (
              <NeumorphBox
                key={bundle.id}
                className="group relative rounded-3xl p-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <Link href={`/bundles/${bundle.id}`} className="block flex h-full flex-col">
                  <div className="relative mb-6 h-64 w-full overflow-hidden rounded-2xl shadow-inner">
                    {bundle.previewImage ? (
                      <>
                        <Image
                          src={bundle.previewImage}
                          alt={bundle.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400 dark:bg-gray-700">
                        No Preview
                      </div>
                    )}
                  </div>

                  <div className="flex flex-grow flex-col px-2 pb-2">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-blue-600 dark:text-white">
                        {bundle.name}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Free
                      </span>
                    </div>
                    <p className="mb-6 line-clamp-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {bundle.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-500 dark:border-gray-700/50 dark:text-gray-400">
                      <span className="font-bold">{bundle.icons.length} Icons</span>
                      <div className="flex gap-2">
                        {bundle.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium dark:bg-gray-700/50"
                          >
                            {tag}
                          </span>
                        ))}
                        {bundle.tags.length > 2 && (
                          <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium dark:bg-gray-700/50">
                            +{bundle.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </NeumorphBox>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-xl font-medium text-gray-500 dark:text-gray-400">
              No bundles found matching your criteria.
            </p>
            <button className="mt-6 font-bold text-blue-600 hover:text-blue-700">
              Clear filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
