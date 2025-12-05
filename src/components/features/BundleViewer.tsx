'use client';

import { useState, useRef } from 'react';
import { DB, Bundle, OperatingSystem } from '@/lib/types';
import Image from 'next/image';
import { Download, Share2, Check, Tag } from 'lucide-react';
import { clsx } from 'clsx';
import JSZip from 'jszip';
import { toPng } from 'html-to-image';
import { CanvasPreview } from '@/components/ui/CanvasPreview';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
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
      {/* Left: Details */}
      <div className="lg:col-span-2 space-y-8">
        <NeumorphBox className="p-8 rounded-3xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">{bundle.name}</h1>
              <div className="flex gap-2">
                {bundle.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full flex items-center gap-1">
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <NeumorphBox 
              as="button" 
              onClick={handleShare} 
              className="p-3 text-gray-500 hover:text-blue-600 hover:neu-pressed rounded-full transition-all"
            >
              <Share2 size={20} />
            </NeumorphBox>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">{bundle.description}</p>

          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Included Icons ({bundle.icons.length})</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {bundle.icons.map(icon => {
              const Icon = (LucideIcons as any)[icon.name];
              if (!Icon) return null;
              return (
                <NeumorphBox key={icon.name} variant="pressed" className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all hover:-translate-y-1">
                  <Icon size={24} className="text-gray-700 dark:text-gray-300" />
                  <span className="text-[10px] font-medium text-gray-500 truncate w-full text-center">{icon.name}</span>
                </NeumorphBox>
              );
            })}
          </div>
        </NeumorphBox>
      </div>

      {/* Right: Download */}
      <div className="space-y-6">
        <div className="glass-panel p-6 sticky top-24">
          <h3 className="font-bold text-xl mb-6 text-gray-800 dark:text-white">Download Bundle</h3>
          
          <div className="space-y-4 mb-8">
            <p className="text-sm font-medium text-gray-500">Select Operating Systems:</p>
            {bundle.targetOS.map(osId => {
              const os = db.operatingSystems.find(o => o.id === osId);
              if (!os) return null;
              return (
                <NeumorphBox
                  as="button"
                  key={osId}
                  onClick={() => toggleOS(osId)}
                  variant={selectedOS.includes(osId) ? 'pressed' : 'flat'}
                  className={clsx(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                    selectedOS.includes(osId)
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 border border-blue-200 dark:border-blue-800"
                      : "hover:translate-x-1"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {os.image && <Image src={os.image} alt={os.name} width={24} height={24} className="rounded-full shadow-sm" />}
                    <span className="font-semibold text-sm">{os.name}</span>
                  </div>
                  {selectedOS.includes(osId) && <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"><Check size={12} className="text-white" /></div>}
                </NeumorphBox>
              );
            })}
          </div>

          <button
            onClick={handleDownload}
            disabled={selectedOS.length === 0 || isGenerating}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
