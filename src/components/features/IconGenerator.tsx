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
import { Desktop } from '@/components/ui/Desktop';

import { Configuration } from './controls/Configuration';
import { IconStylePresets } from './controls/IconStylePresets';
import { FolderColorPicker } from './controls/FolderColorPicker';
import { AdvancedCustomization } from './controls/AdvancedCustomization';
import { Download, Sliders, Layout } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdModal } from '@/components/ui/AdModal';
import { useToast } from '@/components/ui/Toast';
import { useCookieConsent } from '@/components/shared/CookieConsentProvider';
import { renderIcon } from '@/lib/utils/renderIcon';

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
  const [iconSize, setIconSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [iconEffect, setIconEffect] = useState<'raised' | 'sunken' | 'glass' | 'flat'>('sunken');
  const [iconTransparency, setIconTransparency] = useState(0.75); // 0 to 1
  const [folderHue, setFolderHue] = useState(0); // 0 to 360

  const { user, userProfile, loading } = useAuth();
  const { showToast } = useToast();
  const [showAd, setShowAd] = useState(false);

  // Hydration fix
  const [isMounted, setIsMounted] = useState(false);

  // Derived state
  const selectedOS = initialData.operatingSystems.find((os) => os.id === selectedOSId);
  const selectedVersion = selectedOS?.versions.find((v) => v.id === selectedVersionId);
  const selectedFolder = selectedVersion?.folderIcons.find((f) => f.id === selectedFolderId);

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
            variant="desktop"
            actionButton={
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
            hint={
              <p>
                Downloaded as {selectedOS?.format?.toUpperCase() || 'PNG'} for {selectedOS?.name}
              </p>
            }
            theme="macOS"
            desktopProps={{
              wallpaperUrl: selectedVersion?.wallpaperUrl || '',
              folderProps: {
                // Explicitly pass folder props or compatible object
                folder: selectedFolder
                  ? {
                      ...selectedFolder,
                      hue: 0,
                      format: selectedOS?.format || 'png',
                      osName: selectedOS?.name || 'Unknown',
                      offsetX: selectedFolder.offsetX || 0,
                      offsetY: selectedFolder.offsetY || 0,
                    }
                  : undefined,
                loading: 'eager',
                hideLabel: true,
                folderHue,
                offsetX: customOffsetX,
                offsetY: customOffsetY,
                iconSize,
                iconStyle: iconEffect,
                iconTransparency,
                icon: selectedIcon
                  ? renderIcon(iconType, selectedIcon, 'w-full h-full')
                  : undefined,
              },
              mode: 'single',
              variant: 'desktop',
            }}
          />

          {/* Icon Sizes Section */}
          <NeumorphBox title="Icon Sizes" subtitle="Preview in different dimensions">
            <Desktop
              wallpaperUrl={selectedVersion?.wallpaperUrl || ''}
              folderProps={{
                folder: selectedFolder
                  ? {
                      ...selectedFolder,
                      hue: 0,
                      format: selectedOS?.format || 'png',
                      osName: selectedOS?.name || 'Unknown',
                      offsetX: selectedFolder.offsetX || 0,
                      offsetY: selectedFolder.offsetY || 0,
                    }
                  : undefined,
                loading: 'lazy',
                hideLabel: true,
                folderHue,
                offsetX: customOffsetX,
                offsetY: customOffsetY,
                iconSize,
                iconStyle: iconEffect,
                iconTransparency,
                icon: selectedIcon
                  ? renderIcon(iconType, selectedIcon, 'w-full h-full')
                  : undefined,
              }}
              mode="multiple"
              variant="desktop"
              folderSizes={[16, 32, 48, 96, 256]}
              className="min-h-[200px] rounded-2xl"
            />
          </NeumorphBox>

          {/* Hidden CanvasPreview for Download generation */}
          <div className="hidden">
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
              onDownloadError={(err) => showToast('Failed to generate icon package', 'error')}
            />
          </div>
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
