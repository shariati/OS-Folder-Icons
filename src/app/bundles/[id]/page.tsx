import { getDB } from '@/lib/db';
import { BundleViewer } from '@/components/BundleViewer';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';

export default async function BundleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDB();
  const bundle = db.bundles.find(b => b.id === id);

  if (!bundle) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
      <main className="flex-grow pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <BundleViewer bundle={bundle} db={db} />
      </main>
      <Footer />
    </div>
  );
}
