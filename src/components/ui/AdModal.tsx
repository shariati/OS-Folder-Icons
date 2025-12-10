'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, AlertTriangle, Settings } from 'lucide-react';
import { AdConfig } from '@/lib/types';
import Link from 'next/link';
import { useCookieConsent } from '@/components/shared/CookieConsentProvider';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function AdModal({ isOpen, onClose, onComplete }: AdModalProps) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const { preferences, isLoaded } = useCookieConsent();

  // Check if ads are blocked by user preference
  const adsBlocked = isLoaded && !preferences.advertising;

  // Fetch Ad Config
  useEffect(() => {
    if (isOpen && !adsBlocked) {
      fetch('/api/admin/ads')
        .then((res) => res.json())
        .then((data) => setAdConfig(data))
        .catch((err) => console.error('Failed to load ad config', err));
    }
  }, [isOpen, adsBlocked]);

  // Timer Logic - only runs if ads are not blocked
  useEffect(() => {
    if (isOpen && !adsBlocked) {
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
  }, [isOpen, adsBlocked]);

  // Render Ad Script
  useEffect(() => {
    if (isOpen && !adsBlocked && adConfig && adConfig.enabled && adContainerRef.current) {
      const container = adContainerRef.current;
      container.innerHTML = ''; // Clear previous

      if (adConfig.provider === 'adsterra' && adConfig.adsterra.script) {
        // Safe script injection for Adsterra
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
  }, [isOpen, adsBlocked, adConfig]);

  if (!isOpen) return null;

  const handleComplete = () => {
    if (timeLeft === 0 && !adsBlocked) {
      onComplete();
    }
  };

  // Ads Blocked State - Show warning instead of ad
  if (adsBlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X size={24} />
          </button>

          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle size={32} className="text-amber-500" />
            </div>

            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              Download Unavailable
            </h3>

            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Free downloads require advertising cookies to be enabled. You've disabled advertising
              cookies in your privacy settings.
            </p>

            <div className="space-y-3">
              <Link
                href="/cookies"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700"
              >
                <Settings size={18} />
                Enable in Cookie Settings
              </Link>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Or upgrade to Pro for ad-free downloads
              </p>

              <Link
                href="/#pricing"
                className="flex items-center justify-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                View Plans <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal Ad State
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          <X size={24} />
        </button>

        <div className="mb-4 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Download Starting Soon...
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please wait while we prepare your download.
          </p>
        </div>

        {/* Ad Container */}
        <div
          ref={adContainerRef}
          className="mb-6 flex min-h-[250px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
        >
          {!adConfig?.enabled && <div className="text-sm text-gray-400">Advertisement Space</div>}
        </div>

        <div className="space-y-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
              style={{ width: `${((10 - timeLeft) / 10) * 100}%` }}
            />
          </div>

          <button
            onClick={handleComplete}
            disabled={timeLeft > 0}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold transition-all ${
              timeLeft > 0
                ? 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-800'
                : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700'
            }`}
          >
            {timeLeft > 0 ? `Wait ${timeLeft}s` : 'Skip & Download'}
          </button>

          <div className="border-t border-gray-100 pt-2 text-center dark:border-gray-800">
            <p className="mb-2 text-xs text-gray-500">Tired of waiting?</p>
            <Link
              href="/#pricing"
              className="flex items-center justify-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              Upgrade to Pro to remove ads <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
