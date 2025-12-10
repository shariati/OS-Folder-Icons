import { PhotoFrameGenerator } from '@/components/features/PhotoFrameGenerator';
import { Footer } from '@/components/layout/Footer';
import { MainSiteWrapper } from '@/components/layout/MainSiteWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Frame - HDPick',
  description:
    'Create beautiful photo frames with your custom images. Choose from various styles and export for your desktop.',
};

export default function PhotoFramePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainSiteWrapper
        header="Photo Frame"
        tagline="Turn your memories into beautiful desktop widgets. Upload a photo, customize the frame, and download."
      >
        <PhotoFrameGenerator />
      </MainSiteWrapper>
      <Footer />
    </div>
  );
}
