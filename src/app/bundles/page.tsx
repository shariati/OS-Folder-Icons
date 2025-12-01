import { getDB } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Download, Share2 } from 'lucide-react';

export default async function BundlesPage() {
  const db = await getDB();
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Icon Bundles
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Curated collections of folder icons for your workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {db.bundles.map(bundle => (
          <div key={bundle.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <Link href={`/bundles/${bundle.id}`} className="block">
              {bundle.previewImage ? (
                <div className="relative h-56 w-full bg-gray-100">
                  <Image src={bundle.previewImage} alt={bundle.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-56 w-full bg-gray-100 flex items-center justify-center text-gray-400">
                  No Preview
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{bundle.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{bundle.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {bundle.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span>{bundle.icons.length} Icons</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Download size={16} /> Free</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
