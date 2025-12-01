import { getDB } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Download, Search, Filter } from 'lucide-react';
import { Footer } from '@/components/Footer';

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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-6">
            Explore Collections
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Discover hand-picked icon bundles to personalize your operating system.
          </p>
          
          {/* Search and Filter Bar */}
          <div className="max-w-2xl mx-auto flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search bundles..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <button className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 font-medium transition-colors">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {bundles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundles.map(bundle => (
              <div key={bundle.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Link href={`/bundles/${bundle.id}`} className="block h-full flex flex-col">
                  {bundle.previewImage ? (
                    <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <Image src={bundle.previewImage} alt={bundle.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className="h-64 w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                      No Preview
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{bundle.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Free
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 text-sm">{bundle.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{bundle.icons.length} Icons</span>
                      <div className="flex gap-2">
                        {bundle.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs">
                            {tag}
                          </span>
                        ))}
                        {bundle.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs">+{bundle.tags.length - 2}</span>
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
            <p className="text-xl text-gray-500 dark:text-gray-400">No bundles found matching your criteria.</p>
            <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">Clear filters</button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
