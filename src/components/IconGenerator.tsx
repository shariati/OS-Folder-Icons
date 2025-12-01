'use client';

import { useState, useEffect } from 'react';
import { DB, OperatingSystem, OSVersion, FolderIcon } from '@/lib/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { CanvasPreview } from './CanvasPreview';
import { IconPicker } from './IconPicker';
import { Download } from 'lucide-react';

interface IconGeneratorProps {
  initialData: DB;
}

export function IconGenerator({ initialData }: { initialData: DB }) {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [customOffsetX, setCustomOffsetX] = useState(0);
  const [customOffsetY, setCustomOffsetY] = useState(0);

  const [selectedOSId, setSelectedOSId] = useState<string>(initialData.operatingSystems[0]?.id || '');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>('Star');
  const [iconType, setIconType] = useState<'lucide' | 'fontawesome'>('lucide');
  const [iconColor, setIconColor] = useState('#000000');
  const [iconSize, setIconSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [iconEffect, setIconEffect] = useState<'none' | 'carved' | 'emboss' | 'glassy'>('carved');
  const [iconTransparency, setIconTransparency] = useState(0.75); // 0 to 1
  const [folderHue, setFolderHue] = useState(0); // 0 to 360

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
      // Icon Size, Color, and Selection are preserved
    } else {
      // When switching to Advanced, we can keep current settings or reset.
      // Keeping current settings is usually better UX.
      // If coming from Simple, transparency is 0.75 and effect is carved, which is fine.
    }
  };

  const handleDownload = () => {
    const event = new CustomEvent('trigger-download');
    window.dispatchEvent(event);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Controls */}
      <div className="lg:col-span-4 space-y-8">
        
        {/* Mode Toggle */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Customization Mode</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {mode === 'simple' ? 'Quick & Easy' : 'Full Control'}
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex text-sm font-medium">
            <button
              onClick={() => handleModeChange('simple')}
              className={clsx(
                "px-3 py-1.5 rounded-md transition-all",
                mode === 'simple'
                  ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              Simple
            </button>
            <button
              onClick={() => handleModeChange('advanced')}
              className={clsx(
                "px-3 py-1.5 rounded-md transition-all",
                mode === 'advanced'
                  ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              Advanced
            </button>
          </div>
        </div>

        {/* OS Selection */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Operating System</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose where you'll use this icon</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {initialData.operatingSystems.map(os => (
              <button
                key={os.id}
                onClick={() => setSelectedOSId(os.id)}
                className={clsx(
                  "flex items-center gap-2 p-3 rounded-lg border transition-all",
                  selectedOSId === os.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                )}
              >
                {os.image && <Image src={os.image} alt={os.name} width={24} height={24} className="rounded-full" />}
                <span className="font-medium text-sm text-gray-900 dark:text-white">{os.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Version & Folder Style */}
        {selectedOS && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Version</label>
                <select
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  {selectedOS.versions.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Folder Style</label>
                  <p className="text-xs text-gray-500">Select the base folder design</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {selectedVersion?.folderIcons.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolderId(folder.id)}
                      className={clsx(
                        "relative aspect-square rounded-lg border overflow-hidden transition-all",
                        selectedFolderId === folder.id
                          ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      )}
                    >
                      <Image 
                        src={folder.imageUrl} 
                        alt={folder.name} 
                        fill 
                        className="object-contain p-2" 
                        style={{ filter: mode === 'advanced' && folderHue !== 0 ? `hue-rotate(${folderHue}deg) sepia(0.5) saturate(2)` : 'none' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simple Mode Style Presets */}
        {mode === 'simple' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Icon Style</h3>
            <p className="text-sm text-gray-500 mb-4">Choose a preset style</p>
            <div className="grid grid-cols-3 gap-3">
              {(['carved', 'glassy', 'none'] as const).map(effect => (
                <button
                  key={effect}
                  onClick={() => setIconEffect(effect)}
                  className={clsx(
                    "py-3 px-2 rounded-lg text-sm font-medium transition-all border",
                    iconEffect === effect
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                  )}
                >
                  {effect === 'none' ? 'Flat' : effect.charAt(0).toUpperCase() + effect.slice(1)}
                </button>
              ))}
            </div>
          </div>
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            
            {/* Folder Color */}
            <div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Folder Color</h3>
              <p className="text-sm text-gray-500 mb-4">Adjust folder hue</p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={folderHue}
                  onChange={(e) => setFolderHue(parseInt(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-mono w-12 text-right">{folderHue}°</span>
              </div>
            </div>

            {/* Icon Effect */}
            <div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Icon Effect</h3>
              <p className="text-sm text-gray-500 mb-4">Add depth to your icon</p>
              <div className="flex gap-2">
                {(['none', 'carved', 'emboss', 'glassy'] as const).map(effect => (
                  <button
                    key={effect}
                    onClick={() => setIconEffect(effect)}
                    className={clsx(
                      "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors capitalize",
                      iconEffect === effect
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/70"
                    )}
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </div>

            {/* Transparency */}
            <div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Icon Transparency</h3>
              <p className="text-sm text-gray-500 mb-4">Adjust icon opacity</p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={iconTransparency * 100}
                  onChange={(e) => setIconTransparency(parseInt(e.target.value) / 100)}
                  className="w-full"
                />
                <span className="text-xs font-mono w-12 text-right">{Math.round(iconTransparency * 100)}%</span>
              </div>
            </div>

            {/* Position Adjustment */}
            <div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Position Adjustment</h3>
              <p className="text-sm text-gray-500 mb-4">Fine-tune the icon location</p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Horizontal (X)</label>
                    <span className="text-xs text-gray-500">{customOffsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={customOffsetX}
                    onChange={(e) => setCustomOffsetX(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                   <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vertical (Y)</label>
                    <span className="text-xs text-gray-500">{customOffsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={customOffsetY}
                    onChange={(e) => setCustomOffsetY(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <button 
                  onClick={() => { setCustomOffsetX(0); setCustomOffsetY(0); }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Reset Position
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Right Column: Preview */}
      <div className="lg:col-span-8">
        <div className="sticky top-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Preview</h2>
            <div className="flex justify-center mb-8 bg-gray-100 dark:bg-gray-900/50 rounded-xl p-8 checkerboard">
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
            </div>
            
            <div className="space-y-4">
              <button
                id="download-btn"
                onClick={handleDownload}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
              >
                <Download size={24} />
                Download Icon
              </button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Downloaded as {selectedOS?.format?.toUpperCase() || 'PNG'} for {selectedOS?.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
