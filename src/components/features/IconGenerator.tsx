'use client';

import { useState, useEffect } from 'react';
import { DB, OperatingSystem, OSVersion, FolderIcon } from '@/lib/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { CanvasPreview } from '@/components/ui/CanvasPreview';
import { PreviewPanel } from '@/components/ui/PreviewPanel';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { IconPicker } from './IconPicker';
import { Download, Sliders, Layout, Monitor, Folder } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdModal } from '@/components/ui/AdModal';

interface IconGeneratorProps {
  initialData: DB;
  isAdmin?: boolean;
}

export function IconGenerator({ initialData, isAdmin = false }: IconGeneratorProps) {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [customOffsetX, setCustomOffsetX] = useState(0);
  const [customOffsetY, setCustomOffsetY] = useState(0);

  const [selectedOSId, setSelectedOSId] = useState<string>(initialData.operatingSystems[0]?.id || '');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>('Star');
  const [iconType, setIconType] = useState<'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons'>('lucide');
  const [iconColor, setIconColor] = useState('#000000');
  const [iconSize, setIconSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [iconEffect, setIconEffect] = useState<'none' | 'carved' | 'emboss' | 'glassy'>('carved');
  const [iconTransparency, setIconTransparency] = useState(0.75); // 0 to 1
  const [folderHue, setFolderHue] = useState(0); // 0 to 360

  const { userProfile, loading } = useAuth();
  const [showAd, setShowAd] = useState(false);

  // Derived state
  const selectedOS = initialData.operatingSystems.find(os => os.id === selectedOSId);
  const selectedVersion = selectedOS?.versions.find(v => v.id === selectedVersionId);
  const selectedFolder = selectedVersion?.folderIcons.find(f => f.id === selectedFolderId);

  // Set default version and folder when OS or version changes
  useEffect(() => {
    if (selectedOS && selectedOS.versions.length > 0) {
      if (!selectedVersionId || !selectedOS.versions.some(v => v.id === selectedVersionId)) {
        setSelectedVersionId(selectedOS.versions[0].id);
      }
    } else {
      setSelectedVersionId('');
    }
  }, [selectedOS, selectedVersionId]);

  useEffect(() => {
    if (selectedVersion && selectedVersion.folderIcons.length > 0) {
      if (!selectedFolderId || !selectedVersion.folderIcons.some(f => f.id === selectedFolderId)) {
        setSelectedFolderId(selectedVersion.folderIcons[0].id);
      }
    } else {
      setSelectedFolderId('');
    }
  }, [selectedVersion, selectedFolderId]);

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

  const handleDownloadClick = () => {
    if (loading) return;

    // Check if user is free or not logged in (assuming site visitor is free)
    // If isAdmin is true, bypass ad logic
    const isFreeUser = !isAdmin && (!userProfile || userProfile.role === 'free');

    if (isFreeUser) {
      setShowAd(true);
    } else {
      triggerDownload();
    }
  };

  const triggerDownload = () => {
    const event = new CustomEvent('trigger-download');
    window.dispatchEvent(event);
    setShowAd(false);
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
        <NeumorphBox 
          title="Operating System"
          subtitle="Select your platform"
          icon={
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Monitor size={16} />
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            {initialData.operatingSystems.map(os => (
              <NeumorphBox
                as="button"
                key={os.id}
                onClick={() => setSelectedOSId(os.id)}
                variant={selectedOSId === os.id ? 'pressed' : 'flat'}
                className={clsx(
                  "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all duration-200",
                  selectedOSId === os.id
                    ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                    : "hover:-translate-y-1"
                )}
              >
                {os.image && <Image src={os.image} alt={os.name} width={32} height={32} className="rounded-full shadow-sm" />}
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{os.name}</span>
              </NeumorphBox>
            ))}
          </div>
        </NeumorphBox>

        {/* Version & Folder Style */}
        {selectedOS && (
          <NeumorphBox 
            title="Configuration"
            subtitle="Choose your style"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Version</label>
                <div className="relative">
                  <NeumorphBox
                    as="select"
                    variant="pressed"
                    value={selectedVersionId}
                    onChange={(e: any) => setSelectedVersionId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-gray-700 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {selectedOS.versions.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </NeumorphBox>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                    <Folder size={16} />
                  </div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Folder Style</label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {selectedVersion?.folderIcons.map(folder => (
                    <NeumorphBox
                      as="button"
                      key={folder.id}
                      onClick={() => setSelectedFolderId(folder.id)}
                      variant={selectedFolderId === folder.id ? 'pressed' : 'flat'}
                      className={clsx(
                        "relative aspect-square rounded-xl overflow-hidden transition-all duration-200 p-2",
                        selectedFolderId === folder.id
                          ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent"
                          : "hover:-translate-y-1"
                      )}
                    >
                      <Image 
                        src={folder.imageUrl} 
                        alt={folder.name} 
                        fill 
                        className="object-contain p-2" 
                        style={{ filter: folderHue !== 0 ? `hue-rotate(${folderHue}deg) sepia(0.5) saturate(2)` : 'none' }}
                      />
                    </NeumorphBox>
                  ))}
                </div>
              </div>
            </div>
          </NeumorphBox>
        )}

        {/* Simple Mode Style Presets */}
        {mode === 'simple' && (
          <>
            <NeumorphBox 
              title="Icon Style"
              subtitle="Choose a preset style"
            >
              <div className="grid grid-cols-3 gap-3">
                {(['carved', 'glassy', 'none'] as const).map(effect => (
                  <NeumorphBox
                    as="button"
                    key={effect}
                    onClick={() => setIconEffect(effect)}
                    variant={iconEffect === effect ? 'pressed' : 'flat'}
                    className={clsx(
                      "py-3 px-2 rounded-xl text-sm font-bold transition-all",
                      iconEffect === effect
                        ? "text-blue-600"
                        : "text-gray-600 dark:text-gray-300 hover:-translate-y-0.5"
                    )}
                  >
                    {effect === 'none' ? 'Flat' : effect.charAt(0).toUpperCase() + effect.slice(1)}
                  </NeumorphBox>
                ))}
              </div>
            </NeumorphBox>

            {/* Simple Mode Folder Color */}
            <NeumorphBox 
              title="Folder Color"
              subtitle="Colorize your folder"
            >
               <div className="flex flex-wrap gap-3">
                 {[0, 140, 180, 240, 300].map(hue => (
                   <button
                     key={hue}
                     onClick={() => setFolderHue(hue)}
                     className={clsx(
                       "w-12 h-12 rounded-xl transition-all shadow-sm border-2",
                       folderHue === hue 
                         ? "border-blue-500 scale-110 shadow-md" 
                         : "border-transparent hover:scale-105"
                     )}
                     style={{ 
                       backgroundColor: '#3b82f6', // Base blue color
                       filter: `hue-rotate(${hue}deg)` 
                     }}
                     title={`Hue: ${hue}°`}
                   />
                 ))}
               </div>
            </NeumorphBox>
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
          <NeumorphBox 
            className="p-6 rounded-3xl space-y-6"
            title="Advanced Customization"
            subtitle="Fine-tune your icon"
          >
            
            {/* Folder Color */}
            <div>
              <h3 className="text-lg font-bold mb-1 text-gray-700 dark:text-white">Folder Color</h3>
              <div className="flex items-center gap-4 mt-4">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={folderHue}
                  onChange={(e) => setFolderHue(parseInt(e.target.value))}
                  className="w-full h-4 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full appearance-none cursor-pointer shadow-inner"
                />
                <span className="text-xs font-mono w-12 text-right text-gray-500">{folderHue}°</span>
              </div>
            </div>

            {/* Icon Effect */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-white">Icon Effect</h3>
              <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {(['none', 'carved', 'emboss', 'glassy'] as const).map(effect => (
                  <button
                    key={effect}
                    onClick={() => setIconEffect(effect)}
                    className={clsx(
                      "flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all capitalize",
                      iconEffect === effect
                        ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    )}
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </div>

            {/* Transparency */}
            <div>
              <h3 className="text-lg font-bold mb-1 text-gray-700 dark:text-white">Icon Transparency</h3>
              <div className="flex items-center gap-4 mt-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={iconTransparency * 100}
                  onChange={(e) => setIconTransparency(parseInt(e.target.value) / 100)}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-xs font-mono w-12 text-right text-gray-500">{Math.round(iconTransparency * 100)}%</span>
              </div>
            </div>

            {/* Position Adjustment */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-white">Position</h3>
              <NeumorphBox variant="pressed" className="space-y-4 p-4 rounded-xl">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-gray-500">Horizontal (X)</label>
                    <span className="text-xs text-gray-400">{customOffsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={customOffsetX}
                    onChange={(e) => setCustomOffsetX(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                   <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-gray-500">Vertical (Y)</label>
                    <span className="text-xs text-gray-400">{customOffsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={customOffsetY}
                    onChange={(e) => setCustomOffsetY(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <button 
                  onClick={() => { setCustomOffsetX(0); setCustomOffsetY(0); }}
                  className="text-xs text-blue-500 hover:text-blue-600 font-bold w-full text-center mt-2"
                >
                  Reset Position
                </button>
              </NeumorphBox>
            </div>
          </NeumorphBox>
        )}

      </div>

      {/* Right Column: Preview */}
      <div className="lg:col-span-8">
        <div className="sticky top-24">
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
            />
          </PreviewPanel>
        </div>
      </div>
      <AdModal 
        isOpen={showAd} 
        onClose={() => setShowAd(false)} 
        onComplete={triggerDownload} 
      />
    </div>
  );
}
