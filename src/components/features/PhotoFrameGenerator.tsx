'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Download, Move, ZoomIn, Type, Calendar, Flag, RotateCcw } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { clsx } from 'clsx';
import { useToast } from '@/components/ui/Toast';

import { COUNTRIES } from '@/data/countries';
import { PreviewPanel } from '@/components/ui/PreviewPanel';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { AdModal } from '@/components/ui/AdModal';
import { useAuth } from '@/contexts/AuthContext';
import { useCookieConsent } from '@/components/shared/CookieConsentProvider';
import { UploadPhoto } from './UploadPhoto';
import { PhotoDetails } from './PhotoDetails';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

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
  const imageRef = useRef<HTMLImageElement>(null);

  const { showToast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImage(url);
    }
  };

  const handleDownload = async (format: 'png' | 'jpg') => {
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

  const { user, userProfile, loading } = useAuth();

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
        <NeumorphBox title="Frame Color" subtitle="Match your aesthetic">
          <div className="flex gap-3">
            {FRAME_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => setFrameColor(color)}
                className={clsx(
                  'flex flex-1 flex-col items-center gap-2 rounded-xl border-2 py-3 transition-all',
                  frameColor.name === color.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
                )}
              >
                <div
                  className="h-8 w-8 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </NeumorphBox>
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
            <div
              ref={frameRef}
              className="relative flex flex-shrink-0 flex-col items-center shadow-2xl"
              style={{
                width: '420px', // 14 units * 30px scale
                height: '510px', // 17 units * 30px scale
                padding: '30px 30px 120px 30px', // 1 unit top/sides, 4 units bottom
                boxSizing: 'border-box',
                backgroundColor: frameColor.value,
              }}
            >
              {/* Image Area */}
              <div
                className="relative h-full w-full cursor-move overflow-hidden bg-gray-100"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {image ? (
                  <img
                    ref={imageRef}
                    src={image}
                    alt="Uploaded"
                    className="absolute max-w-none"
                    onLoad={(e) => {
                      const { naturalWidth, naturalHeight } = e.currentTarget;
                      const CONTAINER_SIZE = 360;

                      // Calculate scale to cover the container
                      const scaleX = CONTAINER_SIZE / naturalWidth;
                      const scaleY = CONTAINER_SIZE / naturalHeight;
                      const scale = Math.max(scaleX, scaleY);

                      setBaseScale(scale);
                      setZoom(1);

                      // Center the image
                      const x = (CONTAINER_SIZE - naturalWidth) / 2;
                      const y = (CONTAINER_SIZE - naturalHeight) / 2;

                      setPosition({ x, y });
                      setInitialPosition({ x, y });
                    }}
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${baseScale * zoom})`,
                      transformOrigin: 'center',
                      pointerEvents: 'none', // Let the container handle events
                      userSelect: 'none',
                      left: 0,
                      top: 0,
                    }}
                    draggable={false}
                  />
                ) : (
                  <label
                    htmlFor="photo-upload-trigger"
                    className="flex h-full w-full cursor-pointer items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <p className="text-sm font-medium">Upload an image</p>
                  </label>
                )}
              </div>

              {/* Text Area (Absolute positioned relative to frame) */}
              <div className="absolute bottom-0 left-0 flex h-[120px] w-full flex-col justify-center px-[30px] py-4">
                <div className="flex items-end justify-between">
                  <div className="flex flex-col gap-1">
                    <h2
                      className="text-2xl leading-tight"
                      style={{
                        fontFamily: 'var(--font-recursive), sans-serif',
                        fontWeight: 600,
                        color: frameColor.text,
                      }}
                    >
                      {title}
                    </h2>
                    <p
                      className="text-lg"
                      style={{
                        fontFamily: 'var(--font-recursive), sans-serif',
                        fontWeight: 400,
                        color: frameColor.text,
                        opacity: 0.8,
                      }}
                    >
                      {selectedMonth} {selectedYear}
                    </p>
                  </div>
                  <div className="text-4xl drop-shadow-sm filter">{selectedCountry.flag}</div>
                </div>
              </div>
            </div>
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
