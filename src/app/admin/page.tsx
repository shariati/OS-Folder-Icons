import { Metadata } from 'next';

import AdminDashboard from '@/components/admin/AdminDashboard';
import { getDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard - OS Folder Icons',
  description: 'Manage OS Folder Icons content, bundles, and settings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const db = await getDB();
  return <AdminDashboard initialData={db} />;
}
