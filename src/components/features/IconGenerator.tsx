'use client';

import { useState, useEffect, useRef } from 'react';
import { DB, OperatingSystem, OSVersion, FolderIcon } from '@/lib/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { generateICO, generateICNS } from '@/lib/utils/icon-generator';
import { CanvasPreview } from '@/components/ui/CanvasPreview';
import { PreviewPanel } from '@/components/ui/PreviewPanel';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { IconPicker } from './IconPicker';
import { OSSelection } from './controls/OSSelection';
import { Configuration } from './controls/Configuration';
import { IconStylePresets } from './controls/IconStylePresets';
import { FolderColorPicker } from './controls/FolderColorPicker';
import { AdvancedCustomization } from './controls/AdvancedCustomization';
import { Download, Sliders, Layout } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdModal } from '@/components/ui/AdModal';
import { useToast } from '@/components/ui/Toast';
import { useCookieConsent } from '@/components/shared/CookieConsentProvider';
import { storage } from '@/lib/firebase/client';
import { ref, getDownloadURL } from 'firebase/storage';

interface IconGeneratorProps {
  initialData: DB;
  isAdmin?: boolean;
}

export function IconGenerator({ initialData, isAdmin = false }: IconGeneratorProps) {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [customOffsetX, setCustomOffsetX] = useState(0);
  const [customOffsetY, setCustomOffsetY] = useState(0);

  const [selectedOSId, setSelectedOSId] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>('Star');
  const [iconType, setIconType] = useState<'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons'>('lucide');
  const [iconColor, setIconColor] = useState('#000000');
  const [iconSize, setIconSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [iconEffect, setIconEffect] = useState<'none' | 'carved' | 'emboss' | 'glassy'>('carved');
  const [iconTransparency, setIconTransparency] = useState(0.75); // 0 to 1
  const [folderHue, setFolderHue] = useState(0); // 0 to 360

  const { user, userProfile, loading } = useAuth();
  const { showToast } = useToast();
  const [showAd, setShowAd] = useState(false);

  // Hydration fix
  const [isMounted, setIsMounted] = useState(false);
  const [loadedWallpaperUrl, setLoadedWallpaperUrl] = useState<string | null>(null);
  const [loadedFolderUrl, setLoadedFolderUrl] = useState<string | null>(null);
  const [loadingVideoUrl, setLoadingVideoUrl] = useState<string>('');
  const [downloadTs, setDownloadTs] = useState<number>(0);

  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Derived state
  const selectedOS = initialData.operatingSystems.find(os => os.id === selectedOSId);
  const selectedVersion = selectedOS?.versions.find(v => v.id === selectedVersionId);
  const selectedFolder = selectedVersion?.folderIcons.find(f => f.id === selectedFolderId);

  // Loading status helpers
  // Check if current selection matches loaded state
  const isWallpaperReady = !selectedVersion?.wallpaperUrl || selectedVersion.wallpaperUrl === loadedWallpaperUrl;
  const isFolderReady = !selectedFolder?.imageUrl || selectedFolder.imageUrl === loadedFolderUrl;
  const isPreviewReady = isWallpaperReady && isFolderReady;

  useEffect(() => {
    setIsMounted(true);
    // Initialize default selection if none exists
    if (initialData.operatingSystems.length > 0 && !selectedOSId) {
      const defaultOS = initialData.operatingSystems[0];
      setSelectedOSId(defaultOS.id);
      
      if (defaultOS.versions.length > 0) {
        const defaultVersion = defaultOS.versions[0];
        setSelectedVersionId(defaultVersion.id);
        
        if (defaultVersion.folderIcons.length > 0) {
          setSelectedFolderId(defaultVersion.folderIcons[0].id);
        }
      }
    }
  }, [initialData.operatingSystems, selectedOSId]);

  // Handle Wallpaper Loading
  useEffect(() => {
    if (selectedVersion?.wallpaperUrl) {
      // If URLs match, we are already loaded (or in process of loading same url, but here we want to reset if changed)
      if (selectedVersion.wallpaperUrl !== loadedWallpaperUrl) {
          const img = new window.Image();
          img.src = selectedVersion.wallpaperUrl;
          img.onload = () => setLoadedWallpaperUrl(selectedVersion.wallpaperUrl || null);
          img.onerror = () => setLoadedWallpaperUrl(selectedVersion.wallpaperUrl || null);
      }
    } else {
      setLoadedWallpaperUrl(null);
    }
  }, [selectedVersion?.wallpaperUrl, loadedWallpaperUrl]);

  // Handle Folder Image Loading
  useEffect(() => {
    if (selectedFolder?.imageUrl) {
      if (selectedFolder.imageUrl !== loadedFolderUrl) {
          const img = new window.Image();
          img.src = selectedFolder.imageUrl;
          img.onload = () => setLoadedFolderUrl(selectedFolder.imageUrl || null);
          img.onerror = () => setLoadedFolderUrl(selectedFolder.imageUrl || null);
      }
    } else {
      setLoadedFolderUrl(null);
    }
  }, [selectedFolder?.imageUrl, loadedFolderUrl]);

  // Fetch loading video
  useEffect(() => {
    if (storage) {
        getDownloadURL(ref(storage, 'public/Sandy Loading.webm'))
            .then(url => setLoadingVideoUrl(url))
            .catch(err => console.error('Failed to load loading video:', err));
    }
  }, []);


  // Handle Mode Switching
  const handleModeChange = (newMode: 'simple' | 'advanced') => {
    setMode(newMode);
    if (newMode === 'simple') {
      // Reset to Simple Mode defaults
      setIconEffect('carved');
      setIconTransparency(0.75);
      setCustomOffsetX(0);
      setCustomOffsetY(0);
      setFolderHue(0);
    }
  };

  const { preferences } = useCookieConsent();

  const handleDownloadClick = () => {
    if (loading) return;

    // Check if user is free or not logged in
    const isFreeUser = !isAdmin && (!userProfile || userProfile.role === 'free');
    
    // Feature Gating: Advanced Mode is for Pro/Lifetime/Admin only
    if (mode === 'advanced' && isFreeUser) {
        showToast('Advanced mode is available for Pro and Lifetime users only. Please upgrade to use this feature.', 'info');
        return;
    }

    if (isFreeUser) {
       // Extra check: If they somehow disabled ads (e.g. via browser or hack), block them.
       if (!preferences.advertising) {
           showToast("Please enable Advertising cookies to use this free tool, or upgrade to Pro to remove ads.", "error");
           return;
       }
      setShowAd(true);
    } else {
      triggerDownload();
    }
  };

  const triggerDownload = async () => {
    if (!exportRef.current) return;
    
    // Force a fresh render for the hidden export node with new URL
    const ts = Date.now();
    setDownloadTs(ts);
    
    // Wait for state update and image load
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      showToast('Generating icon package...', 'info');

      const format = selectedOS?.format || 'png';
      const fileName = `${selectedOS?.name || 'Custom'} - ${selectedFolder?.name || 'Icon'}`;

      // Determine sizes based on format (Same logic as before)
      let sizes: number[] = [512];
      if (format === 'ico') {
        sizes = [16, 32, 48, 64, 256];
      } else if (format === 'icns') {
        sizes = [16, 32, 64, 128, 256, 512, 1024];
      }

      const images: { width: number, height: number, data: Blob }[] = [];

      for (const size of sizes) {
        // debug log for capture
        console.log(`Capturing DOM for size ${size}x${size}`, {
             folderName: selectedFolder?.name,
             folderImage: selectedFolder?.imageUrl,
             osName: selectedOS?.name,
             format
        });

        const dataUrl = await toPng(exportRef.current, { 
          canvasWidth: size, 
          canvasHeight: size,
          pixelRatio: 1,
          cacheBust: true,
        });

        console.log(`Captured DataURL length: ${dataUrl.length}`, dataUrl.substring(0, 50) + "...");

        // Convert Base64 to Blob manually (CSP-safe)
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        
        images.push({ width: size, height: size, data: blob });
      }

      let finalBlob: Blob;
      let finalFilename = `${fileName}.${format}`;

      if (format === 'ico') {
        finalBlob = await generateICO(images);
      } else if (format === 'icns') {
        finalBlob = await generateICNS(images);
      } else {
        finalBlob = images[0].data;
      }

      // Trigger download
      const url = URL.createObjectURL(finalBlob);
      console.log('Final Generated Blob URL (Click to view):', url);
      
      const link = document.createElement('a');
      link.download = finalFilename;
      link.href = url;
      link.click();

      // Debug: Log the first raw capture to verify base content
      if (images.length > 0) {
        const debugUrl = URL.createObjectURL(images[0].data);
        console.log('DEBUG: First Raw Capture PNG (Click to view):', debugUrl);
        // Clean up debug URL after 1 min
        setTimeout(() => URL.revokeObjectURL(debugUrl), 60000);
      }

      // Delay revocation to allow inspection
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      
      showToast('Download started!', 'success');
      setShowAd(false);

    } catch (err) {
      console.error('Failed to generate icon:', err);
      showToast('Failed to generate icon package', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Controls */}
      <div className="lg:col-span-4 space-y-8">
        
        {/* Mode Toggle */}
        <NeumorphBox className="p-2 space-y-0 flex items-center justify-between">
          <button
            onClick={() => handleModeChange('simple')}
            className={clsx(
              "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
              mode === 'simple'
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            )}
          >
            <Layout size={16} />
            Simple
          </button>
          <button
            onClick={() => handleModeChange('advanced')}
            className={clsx(
              "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
              mode === 'advanced'
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            )}
          >
            <Sliders size={16} />
            Advanced
          </button>
        </NeumorphBox>

        {/* OS Selection */}
        <OSSelection 
          operatingSystems={initialData.operatingSystems}
          selectedOSId={selectedOSId}
          onSelectOS={(id) => {
             setSelectedOSId(id);
             // Cascade selection
             const selectedOS = initialData.operatingSystems.find(os => os.id === id);
             if (selectedOS && selectedOS.versions.length > 0) {
                const firstVersion = selectedOS.versions[0];
                setSelectedVersionId(firstVersion.id);
                if (firstVersion.folderIcons.length > 0) {
                   setSelectedFolderId(firstVersion.folderIcons[0].id);
                } else {
                   setSelectedFolderId('');
                }
             } else {
                setSelectedVersionId('');
                setSelectedFolderId('');
             }
          }}
        />

        {/* Version & Folder Style */}
        <Configuration
           selectedOS={selectedOS}
           selectedVersionId={selectedVersionId}
           onSelectVersion={(newVersionId) => {
              setSelectedVersionId(newVersionId);
              // Cascade to folder
              const newVersion = selectedOS?.versions.find(v => v.id === newVersionId);
              if (newVersion && newVersion.folderIcons.length > 0) {
                setSelectedFolderId(newVersion.folderIcons[0].id);
              } else {
                setSelectedFolderId('');
              }
           }}
           selectedVersion={selectedVersion}
           selectedFolderId={selectedFolderId}
           onSelectFolder={setSelectedFolderId}
           folderHue={folderHue}
        />

        {/* Simple Mode Style Presets */}
        {mode === 'simple' && (
          <>
            <IconStylePresets iconEffect={iconEffect} onSelectEffect={setIconEffect} />
            <FolderColorPicker folderHue={folderHue} onSelectHue={setFolderHue} />
          </>
        )}

        {/* Icon Picker */}
        <IconPicker
          selectedIcon={selectedIcon}
          onSelectIcon={setSelectedIcon}
          iconType={iconType}
          onTypeChange={setIconType}
          color={iconColor}
          onColorChange={setIconColor}
          size={iconSize}
          onSizeChange={setIconSize}
          mode={mode}
        />

        {/* Advanced Controls */}
        {mode === 'advanced' && (
          <AdvancedCustomization
            folderHue={folderHue}
            onFolderHueChange={setFolderHue}
            iconEffect={iconEffect}
            onIconEffectChange={setIconEffect}
            iconTransparency={iconTransparency}
            onIconTransparencyChange={setIconTransparency}
            customOffsetX={customOffsetX}
            onCustomOffsetXChange={setCustomOffsetX}
            customOffsetY={customOffsetY}
            onCustomOffsetYChange={setCustomOffsetY}
          />
        )}

      </div>

      {/* Right Column: Preview */}
      <div className="lg:col-span-8">
        <div className="sticky top-24 space-y-8">
          <PreviewPanel
            actions={
              <button
                id="download-btn"
                onClick={handleDownloadClick}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
              >
                <Download size={24} />
                Download Icon
              </button>
            }
            footerText={
              <p>
                Downloaded as {selectedOS?.format?.toUpperCase() || 'PNG'} for {selectedOS?.name}
              </p>
            }
            cover={true}
          >
            {/* Main Preview */}
            <div className="w-full">
               {isMounted ? (
                 <div className={clsx(
                   "relative w-full min-h-[400px] bg-cover bg-center overflow-hidden",
                   !selectedVersion?.wallpaperUrl && "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900"
                 )}
                      style={selectedVersion?.wallpaperUrl && isWallpaperReady ? { backgroundImage: `url(${selectedVersion.wallpaperUrl})` } : undefined}
                 >
                    {/* Wallpaper Loading State */}
                    {!isPreviewReady && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
                        <div className="flex flex-col items-center gap-3">
                          {loadingVideoUrl ? (
                              <video 
                                src={loadingVideoUrl} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="w-32 h-32 object-contain"
                              />
                          ) : (
                              <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          )}
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Preview...</span>
                        </div>
                      </div>
                    )}

                    {/* Fallback Text if no wallpaper */}
                    {!selectedVersion?.wallpaperUrl && (
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                         <span className="text-4xl font-bold uppercase tracking-widest">Preview</span>
                       </div>
                    )}

                    {/* The Icon Wrapper - static, centered, large */}
                    <div className={clsx(
                      "flex items-center justify-center w-full h-full transform scale-[0.6] absolute inset-0 transition-opacity duration-300",
                      isPreviewReady ? "opacity-100" : "opacity-0"
                    )}>
                          <CanvasPreview
                            ref={previewRef}
                            folderImage={selectedFolder?.imageUrl}
                            iconName={selectedIcon}
                            iconType={iconType}
                            iconColor={iconColor}
                            iconSize={iconSize}
                            offsetX={(selectedFolder?.offsetX || 0) + customOffsetX}
                            offsetY={(selectedFolder?.offsetY || 0) + customOffsetY}
                            format={selectedOS?.format}
                            iconEffect={iconEffect}
                            iconTransparency={iconTransparency}
                            folderHue={folderHue}
                            enableCors={true}
                            key={selectedFolder?.imageUrl}
                          />
                    </div>
                 </div>
               ) : (
                 <div className="w-full min-h-[400px] bg-gray-100 dark:bg-gray-800 animate-pulse" />
               )}
            </div>
          </PreviewPanel>

          {/* Icon Sizes Section */}
          <NeumorphBox title="Icon Sizes" subtitle="Preview in different dimensions" >
            <div 
              className={clsx(
                "relative flex flex-wrap items-end justify-center gap-8 p-6 rounded-2xl bg-cover bg-center overflow-hidden min-h-[200px] transition-all",
                (!selectedVersion?.wallpaperUrl || !isWallpaperReady) && "bg-gray-100 dark:bg-gray-800",
                !isPreviewReady && "animate-pulse"
              )}
              style={selectedVersion?.wallpaperUrl && isWallpaperReady ? { backgroundImage: `url(${selectedVersion.wallpaperUrl})` } : undefined}
            >
               {/* Loading Overlay */}
               {!isPreviewReady && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
                    <div className="flex flex-col items-center gap-3">
                       {loadingVideoUrl ? (
                           <video 
                             src={loadingVideoUrl} 
                             autoPlay 
                             loop 
                             muted 
                             playsInline 
                             className="w-16 h-16 object-contain"
                           />
                       ) : (
                          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                       )}
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Preview...</span>
                    </div>
                  </div>
               )}

              {[16, 32, 48, 96, 256].map((size) => {
                 // Calculate scale based on 512px base
                 const scale = size / 512;
                 return (
                   <div key={size} className={clsx("flex flex-col items-center gap-3 transition-opacity duration-300", isPreviewReady ? "opacity-100" : "opacity-0")}>
                     <div 
                        className="relative transition-transform hover:scale-110"
                        style={{ width: size, height: size }}
                     >
                       <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
                           <CanvasPreview
                              folderImage={selectedFolder?.imageUrl}
                              iconName={selectedIcon}
                              iconType={iconType}
                              iconColor={iconColor}
                              iconSize={iconSize}
                              offsetX={(selectedFolder?.offsetX || 0) + customOffsetX}
                              offsetY={(selectedFolder?.offsetY || 0) + customOffsetY}
                              format={selectedOS?.format}
                              iconEffect={iconEffect}
                              iconTransparency={iconTransparency}
                              folderHue={folderHue}
                              enableCors={true}
                              key={selectedFolder?.imageUrl}
                            />
                       </div>
                     </div>
                     <span className="text-xs font-mono text-white font-bold drop-shadow-md">{size}x{size}</span>
                   </div>
                 );
              })}
            </div>
          </NeumorphBox>

        </div>
      </div>
      <AdModal 
        isOpen={showAd} 
        onClose={() => setShowAd(false)} 
        onComplete={() => {
            setShowAd(false);
            triggerDownload();
        }} 
      />

      {/* Hidden Export Node - Always pure, native size, no effects/opacity */}
      <div style={{ position: 'absolute', top: -9999, left: -9999, width: 512, height: 512, overflow: 'hidden' }}>
        <CanvasPreview
          ref={exportRef}
          folderImage={selectedFolder?.imageUrl ? `${selectedFolder.imageUrl}${selectedFolder.imageUrl.includes('?') ? '&' : '?'}t=${downloadTs}` : undefined}
          iconName={selectedIcon}
          iconType={iconType}
          iconColor={iconColor}
          iconSize={iconSize}
          offsetX={(selectedFolder?.offsetX || 0) + customOffsetX}
          offsetY={(selectedFolder?.offsetY || 0) + customOffsetY}
          format={selectedOS?.format}
          iconEffect={iconEffect}
          iconTransparency={iconTransparency}
          folderHue={folderHue}
          enableCors={true}
          // Important: Key ensures fresh mount on any hierarchy change AND new timestamp
          key={`export-${selectedOSId}-${selectedVersionId}-${selectedFolderId}-${selectedIcon}-${downloadTs}`}
        />
      </div>
    </div>
  );
}
