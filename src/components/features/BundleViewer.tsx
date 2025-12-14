'use client';

import { clsx } from 'clsx';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { Check, Download, Share2, Tag } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useRef, useState } from 'react';

import { CanvasPreview } from '@/components/ui/CanvasPreview';
import { FolderFrame } from '@/components/features/FolderFrame';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { useToast } from '@/components/ui/Toast';
import { Bundle, DB } from '@/lib/types';

export function BundleViewer({ bundle, db }: { bundle: Bundle; db: DB }) {
  const [selectedOS, setSelectedOS] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { showToast } = useToast();

  // Hidden container for generation
  const generatorRef = useRef<HTMLDivElement>(null);
  const [genState, setGenState] = useState<{
    folderImage: string;
    iconName: string;
    offsetX: number;
    offsetY: number;
    format: 'png' | 'ico' | 'icns';
  } | null>(null);

  const toggleOS = (osId: string) => {
    if (selectedOS.includes(osId)) {
      setSelectedOS(selectedOS.filter((id) => id !== osId));
    } else {
      setSelectedOS([...selectedOS, osId]);
    }
  };

  const handleDownload = async () => {
    if (selectedOS.length === 0) return;
    setIsGenerating(true);
    setProgress(0);

    const zip = new JSZip();
    const totalOperations = selectedOS.length * bundle.icons.length; // Approximate
    let completed = 0;

    try {
      for (const osId of selectedOS) {
        const os = db.operatingSystems.find((o) => o.id === osId);
        if (!os) continue;

        const osFolder = zip.folder(os.name);

        // For each version in the OS (usually just one, but let's handle all)
        for (const version of os.versions) {
          // For each folder style in the version (usually just one)
          for (const folder of version.folderIcons) {
            // For each icon in the bundle
            for (const icon of bundle.icons) {
              // Update state to render the specific combination
              // We need to wait for React to render
              await new Promise<void>((resolve) => {
                setGenState({
                  folderImage: folder.imageUrl,
                  iconName: icon.name,
                  offsetX: folder.offsetX || 0,
                  offsetY: folder.offsetY || 0,
                  format: os.format || 'png',
                });
                // Give React a tick to render
                setTimeout(resolve, 50);
              });

              if (generatorRef.current) {
                const dataUrl = await toPng(generatorRef.current, { cacheBust: true });

                // Convert to blob
                const res = await fetch(dataUrl);
                const blob = await res.blob();

                // Handle format conversion if needed (basic logic)
                let fileBlob = blob;
                const ext = os.format || 'png';

                if (ext === 'ico') {
                  // Simple conversion wrapper
                  fileBlob = new File([blob], 'icon.ico', { type: 'image/x-icon' });
                }

                // Add to zip
                // Structure: OS/Version/FolderStyle/IconName.ext
                // Simplified: OS/IconName.ext (if single version/style)
                const fileName = `${icon.name}.${ext}`;
                osFolder?.file(fileName, fileBlob);
              }

              completed++;
              setProgress(Math.round((completed / totalOperations) * 100));
            }
          }
        }
      }

      // Generate Zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.download = `${bundle.name.replace(/\s+/g, '-')}-icons.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Generation failed', error);
      showToast('Failed to generate bundle', 'error');
    } finally {
      setIsGenerating(false);
      setGenState(null);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!', 'success');
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left: Details */}
      {/* Left: Details */}
      <div className="space-y-8 lg:col-span-2">
        <NeumorphBox>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="mb-3 text-3xl font-bold text-gray-800 dark:text-white">
                {bundle.name}
              </h1>
              <div className="flex gap-2">
                {bundle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <NeumorphBox
              as="button"
              onClick={handleShare}
              className="hover:neu-pressed rounded-full p-3 text-gray-500 transition-all hover:text-blue-600"
            >
              <Share2 size={20} />
            </NeumorphBox>
          </div>

          <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            {bundle.description}
          </p>

          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">
            Included Icons ({bundle.icons.length})
          </h3>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
            {bundle.icons.map((icon) => {
              const Icon = (LucideIcons as any)[icon.name];
              if (!Icon) return null;
              return (
                <NeumorphBox
                  key={icon.name}
                  variant="pressed"
                  className="flex flex-col items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-1"
                >
                  <Icon size={24} className="text-gray-700 dark:text-gray-300" />
                  <span className="w-full truncate text-center text-[10px] font-medium text-gray-500">
                    {icon.name}
                  </span>
                </NeumorphBox>
              );
            })}
          </div>
        </NeumorphBox>
      </div>

      {/* Right: Download */}
      <div className="space-y-6">
        <div className="glass-panel sticky top-24 p-6">
          <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">Download Bundle</h3>

          <div className="mb-8 space-y-4">
            <p className="text-sm font-medium text-gray-500">Select Operating Systems:</p>
            {bundle.targetOS.map((osId) => {
              const os = db.operatingSystems.find((o) => o.id === osId);
              if (!os) return null;
              return (
                <NeumorphBox
                  as="button"
                  key={osId}
                  onClick={() => toggleOS(osId)}
                  variant={selectedOS.includes(osId) ? 'pressed' : 'flat'}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-xl p-3 transition-all duration-200',
                    selectedOS.includes(osId)
                      ? 'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20'
                      : 'hover:translate-x-1'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {os.brandIcon ? (
                      <i className={clsx(os.brandIcon, 'text-lg')} />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                        {os.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-semibold">{os.name}</span>
                  </div>
                  {selectedOS.includes(osId) && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </NeumorphBox>
              );
            })}
          </div>

          <button
            onClick={handleDownload}
            disabled={selectedOS.length === 0 || isGenerating}
            className="flex w-full transform items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <>Generating {progress}%...</>
            ) : (
              <>
                <Download size={20} /> Download ZIP
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden Generator */}
      {genState && (
        <div className="pointer-events-none fixed left-0 top-0 opacity-0">
          <div ref={generatorRef}>
            <CanvasPreview format={genState.format} filename="preview">
              <FolderFrame
                folderImage={genState.folderImage}
                iconName={genState.iconName}
                iconType="lucide"
                iconColor="#000000"
                iconSize="md"
                offsetX={genState.offsetX}
                offsetY={genState.offsetY}
              />
            </CanvasPreview>
          </div>
        </div>
      )}
    </div>
  );
}
