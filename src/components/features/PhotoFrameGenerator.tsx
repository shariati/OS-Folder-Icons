'use client';

import { useState, useRef } from 'react';
import { Move, RotateCcw, Download } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { useToast } from '@/components/ui/Toast';

import { COUNTRIES } from '@/data/countries';
import { PreviewPanel } from '@/components/ui/PreviewPanel';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { AdModal } from '@/components/ui/AdModal';
import { useAuth } from '@/contexts/AuthContext';
import { useCookieConsent } from '@/components/shared/CookieConsentProvider';
import { UploadPhoto } from './UploadPhoto';
import { PhotoDetails } from './PhotoDetails';
import { FrameColorSelector } from './FrameColorSelector';
import { PolaroidPhotoFrame } from './PolaroidPhotoFrame';

const YEARS = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - 25 + i).toString());

export function PhotoFrameGenerator() {
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('Tumpak Sewu Waterfall');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  // Date state
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2023');

  // Image manipulation state
  const [zoom, setZoom] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Frame customization state
  const FRAME_COLORS = [
    { name: 'Classic White', value: '#FFFFFF', text: '#1F2937' },
    { name: 'Cream', value: '#FDFBF7', text: '#4B5563' },
    { name: 'Soft Black', value: '#1F2937', text: '#F9FAFB' },
  ];
  const [frameColor, setFrameColor] = useState(FRAME_COLORS[0]);

  const frameRef = useRef<HTMLDivElement>(null);

  const { showToast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImage(url);
    }
  };

  const [isAdOpen, setIsAdOpen] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<'png' | 'jpg' | null>(null);

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const triggerDownload = async (format: 'png' | 'jpg') => {
    if (!frameRef.current) return;

    try {
      // Small delay to ensure rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const options = {
        pixelRatio: 2,
        quality: format === 'jpg' ? 0.95 : undefined,
        backgroundColor: frameColor.value, // Explicitly set background color for export
      };

      const dataUrl =
        format === 'png'
          ? await toPng(frameRef.current, options)
          : await toJpeg(frameRef.current, options);

      const link = document.createElement('a');
      link.download = `photo-frame-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      showToast(
        `Failed to generate image: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'error'
      );
    }
  };

  const { userProfile, loading } = useAuth();

  // We are removing saveStateAndRedirect, so just empty or remove. To be safe with chunks, I'll remove the block.

  const { preferences } = useCookieConsent();

  const handleDownloadClick = (format: 'png' | 'jpg') => {
    if (loading) return;

    // Check if user is free tier
    const isFreeUser = !userProfile || userProfile.role === 'free';

    if (isFreeUser) {
      // Extra check: If they somehow disabled ads (e.g. via browser or hack), block them.
      if (!preferences.advertising) {
        showToast(
          'Please enable Advertising cookies to use this free tool, or upgrade to Pro to remove ads.',
          'error'
        );
        return;
      }
      setPendingDownload(format);
      setIsAdOpen(true);
    } else {
      triggerDownload(format);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Column: Controls */}
      <div className="space-y-6 lg:col-span-4">
        {/* Image Upload */}
        <UploadPhoto onUpload={handleImageUpload} inputId="photo-upload-trigger" />

        {/* Text Inputs */}
        <PhotoDetails
          title={title}
          onTitleChange={setTitle}
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          year={selectedYear}
          onYearChange={setSelectedYear}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          years={YEARS}
        />

        {/* Frame Color Selector */}
        <FrameColorSelector
          colors={FRAME_COLORS}
          selectedColor={frameColor}
          onColorChange={setFrameColor}
        />
      </div>

      {/* Right Column: Preview */}
      <div className="lg:col-span-8">
        <div className="sticky top-24">
          <PreviewPanel
            minHeight="min-h-[600px]"
            controls={
              image && (
                <NeumorphBox
                  title="Adjust Image"
                  variant="pressed"
                  subtitle="Perfect your composition"
                  icon={<Move size={20} />}
                  badge={
                    <button
                      onClick={() => {
                        setZoom(1);
                        setPosition(initialPosition);
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-600"
                    >
                      <RotateCcw size={12} /> Reset
                    </button>
                  }
                >
                  <div>
                    <label className="mb-2 block flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-300">
                      <span>Zoom</span>
                      <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-500 dark:bg-gray-700"
                    />
                  </div>
                </NeumorphBox>
              )
            }
            actionButton={
              <div className="flex gap-4">
                <button
                  onClick={() => handleDownloadClick('png')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700"
                >
                  <Download size={20} />
                  Download PNG
                </button>
                <button
                  onClick={() => handleDownloadClick('jpg')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-4 font-bold text-gray-800 shadow-lg transition-all hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <Download size={20} />
                  Download JPG
                </button>
              </div>
            }
          >
            {/* Polaroid Frame */}
            <PolaroidPhotoFrame
              ref={frameRef}
              image={image}
              title={title}
              date={`${selectedMonth} ${selectedYear}`}
              countryFlag={selectedCountry.flag}
              backgroundColor={frameColor.value}
              textColor={frameColor.text}
              baseScale={baseScale}
              zoom={zoom}
              position={position}
              onAutoFit={(scale, pos) => {
                setBaseScale(scale);
                setZoom(1);
                setPosition(pos);
                setInitialPosition(pos);
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </PreviewPanel>
        </div>
      </div>

      <AdModal
        isOpen={isAdOpen}
        onClose={() => {
          setIsAdOpen(false);
          setPendingDownload(null);
        }}
        onComplete={() => {
          setIsAdOpen(false);
          if (pendingDownload) {
            triggerDownload(pendingDownload);
            setPendingDownload(null);
          }
        }}
      />
    </div>
  );
}
