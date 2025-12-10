'use client';

import { useState, useEffect } from 'react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { useToast } from '@/components/ui/Toast';
import { Save, AlertCircle } from 'lucide-react';
import { AdConfig } from '@/lib/types';
import { clsx } from 'clsx';
import { authenticatedFetch } from '@/lib/fetch-auth';

export function AdSettings() {
  const [config, setConfig] = useState<AdConfig>({
    enabled: false,
    provider: 'google-adsense',
    adsterra: { script: '' },
    googleAdsense: { client: '', slot: '' },
    propellerads: { zoneId: '', script: '' },
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/admin/ads')
      .then((res) => res.json())
      .then((data) => {
        setConfig((prev) => ({ ...prev, ...data }));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        showToast('Failed to load ad settings', 'error');
        setLoading(false);
      });
  }, [showToast]);

  const handleSave = async () => {
    try {
      const res = await authenticatedFetch('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error('Failed to save');

      showToast('Ad settings saved successfully', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to save settings', 'error');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Ad Monetization Settings
        </h2>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <NeumorphBox title="General Settings">
        <div className="flex items-center gap-4">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Enable Ads
            </span>
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
            Active Provider
          </label>
          <div className="flex gap-4">
            {(['google-adsense', 'adsterra', 'propellerads'] as const).map((provider) => (
              <button
                key={provider}
                onClick={() => setConfig({ ...config, provider })}
                className={clsx(
                  'rounded-xl border-2 px-4 py-3 text-sm font-bold capitalize transition-all',
                  config.provider === provider
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700'
                )}
              >
                {provider.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </NeumorphBox>

      {config.provider === 'google-adsense' && (
        <NeumorphBox title="Google AdSense Configuration">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Publisher ID (Client)
            </label>
            <input
              type="text"
              value={config.googleAdsense.client}
              onChange={(e) =>
                setConfig({
                  ...config,
                  googleAdsense: { ...config.googleAdsense, client: e.target.value },
                })
              }
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slot ID
            </label>
            <input
              type="text"
              value={config.googleAdsense.slot}
              onChange={(e) =>
                setConfig({
                  ...config,
                  googleAdsense: { ...config.googleAdsense, slot: e.target.value },
                })
              }
              placeholder="1234567890"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </NeumorphBox>
      )}

      {config.provider === 'adsterra' && (
        <NeumorphBox title="Adsterra Configuration">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Script / Iframe Code
            </label>
            <textarea
              value={config.adsterra.script}
              onChange={(e) =>
                setConfig({ ...config, adsterra: { ...config.adsterra, script: e.target.value } })
              }
              placeholder="Paste your Adsterra script or iframe code here..."
              className="h-32 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 font-mono text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <AlertCircle size={12} />
              Be careful when pasting raw scripts. Ensure they are from a trusted source.
            </p>
          </div>
        </NeumorphBox>
      )}

      {config.provider === 'propellerads' && (
        <NeumorphBox title="PropellerAds Configuration">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Zone ID
            </label>
            <input
              type="text"
              value={config.propellerads.zoneId}
              onChange={(e) =>
                setConfig({
                  ...config,
                  propellerads: { ...config.propellerads, zoneId: e.target.value },
                })
              }
              placeholder="Zone ID"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Script Code
            </label>
            <textarea
              value={config.propellerads.script}
              onChange={(e) =>
                setConfig({
                  ...config,
                  propellerads: { ...config.propellerads, script: e.target.value },
                })
              }
              placeholder="Paste your PropellerAds script here..."
              className="h-32 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 font-mono text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </NeumorphBox>
      )}
    </div>
  );
}
