import { getDB } from '@/lib/db';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  const db = await getDB();
  return <AdminDashboard initialData={db} />;
}
