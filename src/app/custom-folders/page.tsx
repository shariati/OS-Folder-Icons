import { getDB } from '@/lib/db';
import { IconGenerator } from '@/components/features/IconGenerator';
import { Footer } from '@/components/layout/Footer';
import { MainSiteWrapper } from '@/components/layout/MainSiteWrapper';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Custom Folders - HDPick",
  description: "Create custom folder icons for macOS, Windows, and Linux. Choose your style, color, and icon to match your aesthetic.",
};

export default async function CreatePage() {
  const db = await getDB();

  return (
    <div className="min-h-screen flex flex-col">
      <MainSiteWrapper
        preHeader="Personalize every pixel"
        header="Custom Folders"
        tagline="Create custom folder icons for macOS, Windows, and Linux. Choose your style, color, and icon to match your aesthetic."
      >
        <IconGenerator initialData={db} />
      </MainSiteWrapper>
      <Footer />
    </div>
  );
}
