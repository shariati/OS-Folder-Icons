'use client';

import { useState, useEffect } from 'react';
import { DB, OperatingSystem, OSVersion, FolderIcon } from '@/lib/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { CanvasPreview } from '@/components/ui/CanvasPreview';
import { PreviewPanel } from '@/components/ui/PreviewPanel';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeumorphButton } from '@/components/ui/NeumorphButton';
import { IconPicker } from './IconPicker';
import { OSSelection } from './controls/OSSelection';
import { NeumorphToggleGroup } from '@/components/ui/NeumorphToggleGroup';

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
  const [iconType, setIconType] = useState<
    'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons'
  >('lucide');
  const [iconColor, setIconColor] = useState('#000000');
  const [iconSize, setIconSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [iconEffect, setIconEffect] = useState<'raised' | 'sunken' | 'glass' | 'flat'>('sunken');
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

  // Derived state
  const selectedOS = initialData.operatingSystems.find((os) => os.id === selectedOSId);
  const selectedVersion = selectedOS?.versions.find((v) => v.id === selectedVersionId);
  const selectedFolder = selectedVersion?.folderIcons.find((f) => f.id === selectedFolderId);

  // Loading status helpers
  // Check if current selection matches loaded state
  const isWallpaperReady =
    !selectedVersion?.wallpaperUrl || selectedVersion.wallpaperUrl === loadedWallpaperUrl;
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
        .then((url) => setLoadingVideoUrl(url))
        .catch((err) => console.error('Failed to load loading video:', err));
    }
  }, []);

  // Handle Mode Switching
  const handleModeChange = (newMode: 'simple' | 'advanced') => {
    setMode(newMode);
    if (newMode === 'simple') {
      // Reset to Simple Mode defaults
      setIconEffect('sunken');
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
      showToast(
        'Advanced mode is available for Pro and Lifetime users only. Please upgrade to use this feature.',
        'info'
      );
      return;
    }

    if (isFreeUser) {
      // Extra check: If they somehow disabled ads (e.g. via browser or hack), block them.
      if (!preferences.advertising) {
        showToast(
          'Please enable Advertising cookies to use this free tool, or upgrade to Pro to remove ads.',
          'error'
        );
        return;
      }
      setShowAd(true);
    } else {
      triggerDownload();
    }
  };

  const triggerDownload = () => {
    showToast('Generating icon package...', 'info');
    const event = new CustomEvent('trigger-download');
    window.dispatchEvent(event);
    setShowAd(false);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Column: Controls */}
      <div className="space-y-8 lg:col-span-4">
        {/* Mode Toggle */}
        <NeumorphToggleGroup
          items={[
            { value: 'simple', label: 'Simple', icon: <Layout size={16} /> },
            { value: 'advanced', label: 'Advanced', icon: <Sliders size={16} /> },
          ]}
          value={mode}
          onChange={(val) => handleModeChange(val as 'simple' | 'advanced')}
        />

        {/* OS Selection */}
        <OSSelection
          operatingSystems={initialData.operatingSystems}
          selectedOSId={selectedOSId}
          onSelectOS={(id) => {
            setSelectedOSId(id);
            // Cascade selection
            const selectedOS = initialData.operatingSystems.find((os) => os.id === id);
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
            const newVersion = selectedOS?.versions.find((v) => v.id === newVersionId);
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
              <NeumorphButton
                id="download-btn"
                onClick={handleDownloadClick}
                variant="flat"
                className="w-full gap-3 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 text-lg text-white shadow-lg shadow-blue-500/30 hover:-translate-y-0 hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
                icon={<Download size={24} />}
              >
                Download Icon
              </NeumorphButton>
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
                <div
                  className={clsx(
                    'relative min-h-[400px] w-full overflow-hidden bg-cover bg-center',
                    !selectedVersion?.wallpaperUrl &&
                      'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900'
                  )}
                  style={
                    selectedVersion?.wallpaperUrl && isWallpaperReady
                      ? { backgroundImage: `url(${selectedVersion.wallpaperUrl})` }
                      : undefined
                  }
                >
                  {/* Wallpaper Loading State */}
                  {!isPreviewReady && (
                    <div className="absolute inset-0 z-50 flex animate-pulse items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <div className="flex flex-col items-center gap-3">
                        {loadingVideoUrl ? (
                          <video
                            src={loadingVideoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="h-32 w-32 object-contain"
                          />
                        ) : (
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                          Loading Preview...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Fallback Text if no wallpaper */}
                  {!selectedVersion?.wallpaperUrl && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
                      <span className="text-4xl font-bold uppercase tracking-widest">Preview</span>
                    </div>
                  )}

                  {/* The Icon Wrapper - static, centered, large */}
                  <div
                    className={clsx(
                      'absolute inset-0 flex h-full w-full scale-[0.6] transform items-center justify-center transition-opacity duration-300',
                      isPreviewReady ? 'opacity-100' : 'opacity-0'
                    )}
                  >
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
                      enableDownload={true}
                      osName={selectedOS?.name}
                      folderName={selectedFolder?.name}
                      onDownloadComplete={() => showToast('Download started!', 'success')}
                      onDownloadError={(err) =>
                        showToast('Failed to generate icon package', 'error')
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="min-h-[400px] w-full animate-pulse bg-gray-100 dark:bg-gray-800" />
              )}
            </div>
          </PreviewPanel>

          {/* Icon Sizes Section */}
          <NeumorphBox title="Icon Sizes" subtitle="Preview in different dimensions">
            <div
              className={clsx(
                'relative flex min-h-[200px] flex-wrap items-end justify-center gap-8 overflow-hidden rounded-2xl bg-cover bg-center p-6 transition-all',
                (!selectedVersion?.wallpaperUrl || !isWallpaperReady) &&
                  'bg-gray-100 dark:bg-gray-800',
                !isPreviewReady && 'animate-pulse'
              )}
              style={
                selectedVersion?.wallpaperUrl && isWallpaperReady
                  ? { backgroundImage: `url(${selectedVersion.wallpaperUrl})` }
                  : undefined
              }
            >
              {/* Loading Overlay */}
              {!isPreviewReady && (
                <div className="absolute inset-0 z-50 flex animate-pulse items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="flex flex-col items-center gap-3">
                    {loadingVideoUrl ? (
                      <video
                        src={loadingVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-16 w-16 object-contain"
                      />
                    ) : (
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Loading Preview...
                    </span>
                  </div>
                </div>
              )}

              {[16, 32, 48, 96, 256].map((size) => {
                // Calculate scale based on 512px base
                const scale = size / 512;
                return (
                  <div
                    key={size}
                    className={clsx(
                      'flex flex-col items-center gap-3 transition-opacity duration-300',
                      isPreviewReady ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <div
                      className="relative transition-transform hover:scale-110"
                      style={{ width: size, height: size }}
                    >
                      <div
                        className="absolute left-0 top-0 origin-top-left"
                        style={{ transform: `scale(${scale})` }}
                      >
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
                    <span className="font-mono text-xs font-bold text-white drop-shadow-md">
                      {size}x{size}
                    </span>
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
    </div>
  );
}
