import { PhotoFrameGenerator } from '@/components/features/PhotoFrameGenerator';
import { Footer } from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Photo Frame - HDPick",
  description: "Create beautiful photo frames with your custom images. Choose from various styles and export for your desktop.",
};

export default function PhotoFramePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Photo Frame</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Turn your memories into beautiful desktop widgets. 
            Upload a photo, customize the frame, and download.
          </p>
        </div>
        
        <PhotoFrameGenerator />
      </main>
      <Footer />
    </div>
  );
}
