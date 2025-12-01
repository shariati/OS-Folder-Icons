'use client';

import { useState, useRef } from 'react';
import { DB, Bundle, OperatingSystem } from '@/lib/types';
import Image from 'next/image';
import { Download, Share2, Check } from 'lucide-react';
import { clsx } from 'clsx';
import JSZip from 'jszip';
import { toPng } from 'html-to-image';
import { CanvasPreview } from './CanvasPreview';
import * as LucideIcons from 'lucide-react';

export function BundleViewer({ bundle, db }: { bundle: Bundle, db: DB }) {
  const [selectedOS, setSelectedOS] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
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
      setSelectedOS(selectedOS.filter(id => id !== osId));
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
        const os = db.operatingSystems.find(o => o.id === osId);
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
               await new Promise<void>(resolve => {
                 setGenState({
                   folderImage: folder.imageUrl,
                   iconName: icon.name,
                   offsetX: folder.offsetX || 0,
                   offsetY: folder.offsetY || 0,
                   format: os.format || 'png'
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
                 let ext = os.format || 'png';
                 
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
      alert('Failed to generate bundle');
    } finally {
      setIsGenerating(false);
      setGenState(null);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Details */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{bundle.name}</h1>
              <div className="flex gap-2">
                {bundle.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={handleShare} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Share2 />
            </button>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">{bundle.description}</p>

          <h3 className="font-semibold text-lg mb-4">Included Icons ({bundle.icons.length})</h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-4">
            {bundle.icons.map(icon => {
              const Icon = (LucideIcons as any)[icon.name];
              if (!Icon) return null;
              return (
                <div key={icon.name} className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Icon size={24} className="text-gray-700 dark:text-gray-300" />
                  <span className="text-xs text-gray-500 truncate w-full text-center">{icon.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Download */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 sticky top-8">
          <h3 className="font-semibold text-lg mb-4">Download Bundle</h3>
          
          <div className="space-y-4 mb-6">
            <p className="text-sm text-gray-500">Select Operating Systems to include:</p>
            {bundle.targetOS.map(osId => {
              const os = db.operatingSystems.find(o => o.id === osId);
              if (!os) return null;
              return (
                <button
                  key={osId}
                  onClick={() => toggleOS(osId)}
                  className={clsx(
                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                    selectedOS.includes(osId)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {os.image && <Image src={os.image} alt={os.name} width={24} height={24} className="rounded-full" />}
                    <span className="font-medium">{os.name}</span>
                  </div>
                  {selectedOS.includes(osId) && <Check size={18} />}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleDownload}
            disabled={selectedOS.length === 0 || isGenerating}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>Generating {progress}%...</>
            ) : (
              <><Download size={20} /> Download ZIP</>
            )}
          </button>
        </div>
      </div>

      {/* Hidden Generator */}
      {genState && (
        <div className="fixed top-0 left-0 opacity-0 pointer-events-none">
          <div ref={generatorRef}>
             <CanvasPreview
               folderImage={genState.folderImage}
               iconName={genState.iconName}
               iconType="lucide"
               iconColor="#000000" // Default color for bundles? Or allow user to pick? Assuming default black for now.
               iconSize="medium" // Default size
               offsetX={genState.offsetX}
               offsetY={genState.offsetY}
               format={genState.format}
             />
          </div>
        </div>
      )}
    </div>
  );
}
