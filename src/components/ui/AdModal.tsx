'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { AdConfig } from '@/lib/types';
import Link from 'next/link';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function AdModal({ isOpen, onClose, onComplete }: AdModalProps) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Ad Config
  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/ads')
        .then(res => res.json())
        .then(data => setAdConfig(data))
        .catch(err => console.error('Failed to load ad config', err));
    }
  }, [isOpen]);

  // Timer Logic
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(10);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  // Render Ad Script
  useEffect(() => {
    if (isOpen && adConfig && adConfig.enabled && adContainerRef.current) {
      const container = adContainerRef.current;
      container.innerHTML = ''; // Clear previous

      if (adConfig.provider === 'adsterra' && adConfig.adsterra.script) {
        // Safe script injection for Adsterra
        const script = document.createElement('script');
        // Extract src if it's a script tag, or just innerHTML
        // This is a simplified handler. Real-world might need more robust parsing.
        // For now, assuming user pastes raw HTML/JS. 
        // Using a sandboxed iframe is safer for raw HTML.
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '300px';
        iframe.style.border = 'none';
        container.appendChild(iframe);
        
        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(adConfig.adsterra.script);
            doc.close();
        }

      } else if (adConfig.provider === 'google-adsense' && adConfig.googleAdsense.client) {
         // Google AdSense
         const ins = document.createElement('ins');
         ins.className = 'adsbygoogle';
         ins.style.display = 'block';
         ins.setAttribute('data-ad-client', adConfig.googleAdsense.client);
         ins.setAttribute('data-ad-slot', adConfig.googleAdsense.slot);
         ins.setAttribute('data-ad-format', 'auto');
         ins.setAttribute('data-full-width-responsive', 'true');
         container.appendChild(ins);

         try {
           (window as any).adsbygoogle = (window as any).adsbygoogle || [];
           (window as any).adsbygoogle.push({});
         } catch (e) {
           console.error('AdSense error', e);
         }

      } else if (adConfig.provider === 'propellerads' && adConfig.propellerads.script) {
          // PropellerAds (similar to Adsterra, often script based)
          const iframe = document.createElement('iframe');
          iframe.style.width = '100%';
          iframe.style.height = '300px';
          iframe.style.border = 'none';
          container.appendChild(iframe);
          
          const doc = iframe.contentWindow?.document;
          if (doc) {
              doc.open();
              doc.write(adConfig.propellerads.script);
              doc.close();
          }
      }
    }
  }, [isOpen, adConfig]);

  if (!isOpen) return null;

  const handleComplete = () => {
    if (timeLeft === 0) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl max-w-lg w-full relative shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 z-10"
        >
          <X size={24} />
        </button>
        
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Download Starting Soon...</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please wait while we prepare your download.
          </p>
        </div>

        {/* Ad Container */}
        <div 
            ref={adContainerRef} 
            className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden min-h-[250px] mb-6 border border-gray-100 dark:border-gray-700"
        >
            {!adConfig?.enabled && (
                <div className="text-gray-400 text-sm">Advertisement Space</div>
            )}
        </div>

        <div className="space-y-4">
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${((10 - timeLeft) / 10) * 100}%` }}
            />
          </div>

          <button
            onClick={handleComplete}
            disabled={timeLeft > 0}
            className={`w-full py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              timeLeft > 0
                ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
            }`}
          >
            {timeLeft > 0 ? `Wait ${timeLeft}s` : 'Skip & Download'}
          </button>

          <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 mb-2">Tired of waiting?</p>
              <Link href="/pricing" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                  Upgrade to Pro to remove ads <ExternalLink size={12} />
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
