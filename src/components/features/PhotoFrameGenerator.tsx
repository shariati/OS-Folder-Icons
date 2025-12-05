'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Download, Move, ZoomIn, Type, Calendar, Flag, RotateCcw } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { clsx } from 'clsx';

import { COUNTRIES } from '@/data/countries';
import { PreviewPanel } from '@/components/ui/PreviewPanel';

export function PhotoFrameGenerator() {
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('Tumpak Sewu Waterfall');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  
  // Date state
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2023');
  
  // Country Search State
  const [countryQuery, setCountryQuery] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
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
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = COUNTRIES.filter(country => 
    country.name.toLowerCase().includes(countryQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      await new Promise(resolve => setTimeout(resolve, 100));

      const options = {
        pixelRatio: 2,
        quality: format === 'jpg' ? 0.95 : undefined,
        backgroundColor: frameColor.value, // Explicitly set background color for export
      };

      const dataUrl = format === 'png' 
        ? await toPng(frameRef.current, options)
        : await toJpeg(frameRef.current, options);
        
      const link = document.createElement('a');
      link.download = `photo-frame-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      alert(`Failed to generate image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Controls */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Image Upload */}
        <div className="neu-flat p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4 text-gray-700 dark:text-white flex items-center gap-2">
            <Upload size={20} />
            Upload Photo
          </h3>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400"><span className="font-bold">Click to upload</span> or drag and drop</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        {/* Text Inputs */}
        <div className="neu-flat p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold mb-2 text-gray-700 dark:text-white flex items-center gap-2">
            <Type size={20} />
            Details
          </h3>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none bg-transparent"
              placeholder="e.g. Tumpak Sewu Waterfall"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date</label>
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none bg-transparent appearance-none"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none bg-transparent appearance-none"
              >
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative" ref={countryDropdownRef}>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Country Flag</label>
            <div 
              className="w-full px-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white bg-transparent flex items-center justify-between cursor-pointer"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <span>{selectedCountry.name}</span>
              </div>
              <span className="text-xs">▼</span>
            </div>

            {showCountryDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-60 overflow-y-auto border border-gray-100 dark:border-gray-700">
                <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search country..."
                    className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none text-sm"
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
                {filteredCountries.map(country => (
                  <div
                    key={country.code}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                    onClick={() => {
                      setSelectedCountry(country);
                      setShowCountryDropdown(false);
                      setCountryQuery('');
                    }}
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="px-4 py-3 text-gray-500 text-center text-sm">No countries found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Frame Color Selector */}
        <div className="neu-flat p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold mb-2 text-gray-700 dark:text-white flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: frameColor.value }}></div>
            Frame Color
          </h3>
          <div className="flex gap-3">
            {FRAME_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => setFrameColor(color)}
                className={clsx(
                  "flex-1 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                  frameColor.name === color.name 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                    : "border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <div 
                  className="w-8 h-8 rounded-full shadow-sm border border-gray-200" 
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{color.name}</span>
              </button>
            ))}
          </div>
        </div>


      </div>

      {/* Right Column: Preview */}
      <div className="lg:col-span-8">
        <div className="sticky top-24">
          <PreviewPanel
            minHeight="min-h-[600px]"
            controls={
              image && (
                <div className="neu-flat p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-white flex items-center gap-2">
                      <Move size={20} />
                      Adjust Image
                    </h3>
                    <button 
                      onClick={() => { setZoom(1); setPosition(initialPosition); }}
                      className="text-xs text-blue-500 font-bold flex items-center gap-1 hover:text-blue-600"
                    >
                      <RotateCcw size={12} /> Reset
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
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
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              )
            }
            actions={
              <div className="flex gap-4">
                <button
                  onClick={() => handleDownload('png')}
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download PNG
                </button>
                <button
                  onClick={() => handleDownload('jpg')}
                  className="flex-1 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg transition-all flex items-center justify-center gap-2"
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
              className="shadow-2xl relative flex flex-col items-center flex-shrink-0"
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
                className="w-full h-full bg-gray-100 overflow-hidden relative cursor-move"
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
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <p className="text-sm font-medium">Upload an image</p>
                  </div>
                )}
              </div>

              {/* Text Area (Absolute positioned relative to frame) */}
              <div className="absolute bottom-0 left-0 w-full h-[120px] px-[30px] py-4 flex flex-col justify-center">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <h2 
                      className="text-2xl leading-tight"
                      style={{ 
                        fontFamily: 'var(--font-recursive), sans-serif', 
                        fontWeight: 600,
                        color: frameColor.text 
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
                        opacity: 0.8
                      }}
                    >
                      {selectedMonth} {selectedYear}
                    </p>
                  </div>
                  <div className="text-4xl filter drop-shadow-sm">
                    {selectedCountry.flag}
                  </div>
                </div>
              </div>
            </div>
          </PreviewPanel>
        </div>
      </div>
    </div>
  );
}
