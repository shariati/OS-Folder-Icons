'use client';

import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { useToast } from '@/components/ui/Toast';

import { COUNTRIES } from '@/data/countries';
import { PreviewPanel } from '@/components/ui/PreviewPanel';
import { AdModal } from '@/components/ui/AdModal';
import { useAuth } from '@/contexts/AuthContext';
import { useCookieConsent } from '@/components/shared/CookieConsentProvider';
import { CanvasPreview } from '@/components/ui/CanvasPreview';
import { NeumorphButton } from '@/components/ui/NeumorphButton';
import { UploadPhoto } from './UploadPhoto';
import { PhotoDetails } from './PhotoDetails';
import { FrameColorSelector } from './FrameColorSelector';
import { PolaroidPhotoFrame } from './PolaroidPhotoFrame';
import { AdjustImageControl } from './controls/AdjustImageControl';

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
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
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

  const { userProfile, loading } = useAuth();

  // We are removing saveStateAndRedirect, so just empty or remove. To be safe with chunks, I'll remove the block.

  const { preferences } = useCookieConsent();

  const handleDownloadClick = () => {
    if (loading) return;

    // Check if user is free tier
    const isFreeUser = !userProfile || userProfile.role === 'free';

    if (isFreeUser) {
      if (!preferences.advertising) {
        showToast(
          'Please enable Advertising cookies to use this free tool, or upgrade to Pro to remove ads.',
          'error'
        );
        return;
      }
      setIsAdOpen(true);
      setPendingDownload('png'); // Just use a truthy value to indicate pending
    } else {
      triggerDownload();
    }
  };

  const triggerDownload = () => {
    showToast('Generating high-res photo...', 'info');
    const event = new CustomEvent('trigger-photo-download');
    window.dispatchEvent(event);
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
                <AdjustImageControl
                  zoom={zoom}
                  onZoomChange={setZoom}
                  onReset={() => {
                    setZoom(1);
                    setPosition(initialPosition);
                  }}
                />
              )
            }
            actionButton={
              <NeumorphButton
                onClick={() => handleDownloadClick()}
                variant="flat"
                className="w-full gap-3 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 text-lg text-white shadow-lg shadow-blue-500/30 hover:-translate-y-0 hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
                icon={<Download size={24} />}
              >
                Download Photo
              </NeumorphButton>
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

      {/* Hidden CanvasPreview for High-Res Download - Placed outside grid to prevent layout issues */}
      <div
        style={{ position: 'absolute', left: -9999, top: -9999, opacity: 0, pointerEvents: 'none' }}
      >
        <CanvasPreview
          enableDownload={true}
          triggerEventName="trigger-photo-download"
          format="png"
          filename={`Polaroid - ${title}`}
          exactSize={true}
          pixelRatio={2}
          onDownloadComplete={() => showToast('Download started!', 'success')}
          onDownloadError={(err) => showToast('Failed to generate image', 'error')}
          containerClassName="w-[1260px] h-[1530px]" // 3x scale of 420x510
        >
          <div className="origin-top-left scale-[3] transform">
            <PolaroidPhotoFrame
              image={image}
              title={title}
              date={`${selectedMonth} ${selectedYear}`}
              countryFlag={selectedCountry.flag}
              backgroundColor={frameColor.value}
              textColor={frameColor.text}
              baseScale={baseScale}
              zoom={zoom}
              position={position}
              onAutoFit={() => {}} // No-op for render
              onMouseDown={() => {}}
              onMouseMove={() => {}}
              onMouseUp={() => {}}
              onMouseLeave={() => {}}
            />
          </div>
        </CanvasPreview>
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
            triggerDownload();
            setPendingDownload(null);
          }
        }}
      />
    </div>
  );
}
