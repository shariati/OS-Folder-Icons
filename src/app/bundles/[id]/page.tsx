import { notFound } from 'next/navigation';

import { BundleViewer } from '@/components/features/BundleViewer';
import { Footer } from '@/components/layout/Footer';
import { getDB } from '@/lib/db';

export default async function BundleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDB();
  const bundle = db.bundles.find((b) => b.id === id);

  if (!bundle) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#e0e5ec] dark:bg-gray-900">
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 pb-12 pt-32 sm:px-6 lg:px-8">
        <BundleViewer bundle={bundle} db={db} />
      </main>
      <Footer />
    </div>
  );
}
