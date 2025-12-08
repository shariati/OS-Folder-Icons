import { getDB } from '@/lib/db';
import { IconGenerator } from '@/components/features/IconGenerator';
import { Footer } from '@/components/layout/Footer';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Custom Folders - HDPick",
  description: "Create custom folder icons for macOS, Windows, and Linux. Choose your style, color, and icon to match your aesthetic.",
};

export default async function CreatePage() {
  const db = await getDB();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-10 text-center">
          <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase text-sm mb-3 block">
            Personalize every pixel
          </span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Custom Folders</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Create custom folder icons for macOS, Windows, and Linux. 
            Choose your style, color, and icon to match your aesthetic.
          </p>
        </div>
        
        <IconGenerator initialData={db} />
      </main>
      <Footer />
    </div>
  );
}
