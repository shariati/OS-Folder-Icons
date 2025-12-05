import { getDB } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Download, Search, Filter } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Icon Bundles - HDPick",
  description: "Browse and download curated collections of folder icons for macOS, Windows, and Linux. Find the perfect style for your desktop.",
};

export default async function BundlesPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const db = await getDB();
  const { category, q } = searchParams;

  let bundles = db.bundles;

  // Simple filtering (in a real app, this might be DB-side or more robust)
  if (category) {
    bundles = bundles.filter(b => b.tags.some(t => t.toLowerCase() === category.toLowerCase()));
  }
  if (q) {
    bundles = bundles.filter(b => b.name.toLowerCase().includes(q.toLowerCase()));
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
      <div className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-white sm:text-5xl mb-6">
            Explore Collections
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            Discover hand-picked icon bundles to personalize your operating system.
          </p>
          
          {/* Search and Filter Bar */}
          <div className="max-w-3xl mx-auto flex gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search bundles..." 
                className="w-full pl-14 pr-6 py-4 rounded-2xl neu-pressed text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent transition-all"
              />
            </div>
            <button className="px-8 py-4 rounded-2xl neu-flat hover:neu-pressed text-gray-700 dark:text-gray-200 flex items-center gap-3 font-bold transition-all">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {bundles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {bundles.map(bundle => (
              <div key={bundle.id} className="group relative neu-flat p-4 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <Link href={`/bundles/${bundle.id}`} className="block h-full flex flex-col">
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-inner mb-6">
                    {bundle.previewImage ? (
                      <>
                        <Image src={bundle.previewImage} alt={bundle.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    ) : (
                      <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                        No Preview
                      </div>
                    )}
                  </div>
                  
                  <div className="px-2 pb-2 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">{bundle.name}</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Free
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 text-sm font-medium">{bundle.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700/50 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-bold">{bundle.icons.length} Icons</span>
                      <div className="flex gap-2">
                        {bundle.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                        {bundle.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-xs font-medium">+{bundle.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">No bundles found matching your criteria.</p>
            <button className="mt-6 text-blue-600 hover:text-blue-700 font-bold">Clear filters</button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
