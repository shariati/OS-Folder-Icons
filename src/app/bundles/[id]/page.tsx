import { getDB } from '@/lib/db';
import { BundleViewer } from '@/components/BundleViewer';
import { notFound } from 'next/navigation';

export default async function BundleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDB();
  const bundle = db.bundles.find(b => b.id === id);

  if (!bundle) {
    notFound();
  }

  return <BundleViewer bundle={bundle} db={db} />;
}
