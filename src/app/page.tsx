import { getDB } from '@/lib/db';
import { IconGenerator } from '@/components/IconGenerator';

export default async function Home() {
  const db = await getDB();
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Custom OS Folder Icons
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Customize your folder icons for macOS, Windows, and Linux.
        </p>
      </div>
      <IconGenerator initialData={db} />
    </div>
  );
}
