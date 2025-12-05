'use client';

import { useState, useEffect } from 'react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { useToast } from '@/components/ui/Toast';
import { Save, AlertCircle } from 'lucide-react';
import { AdConfig } from '@/lib/types';
import { clsx } from 'clsx';

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
      .then(res => res.json())
      .then(data => {
        setConfig(prev => ({ ...prev, ...data }));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to load ad settings', 'error');
        setLoading(false);
      });
  }, [showToast]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/ads', {
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ad Monetization Settings</h2>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-blue-500/30"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <NeumorphBox title="General Settings">
        <div className="flex items-center gap-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={config.enabled}
              onChange={e => setConfig({ ...config, enabled: e.target.checked })}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Enable Ads</span>
          </label>
        </div>

        <div>
           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Active Provider</label>
           <div className="flex gap-4">
             {(['google-adsense', 'adsterra', 'propellerads'] as const).map(provider => (
               <button
                 key={provider}
                 onClick={() => setConfig({ ...config, provider })}
                 className={clsx(
                   "px-4 py-3 rounded-xl border-2 font-bold text-sm capitalize transition-all",
                   config.provider === provider
                     ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                     : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Publisher ID (Client)</label>
            <input
              type="text"
              value={config.googleAdsense.client}
              onChange={e => setConfig({ ...config, googleAdsense: { ...config.googleAdsense, client: e.target.value } })}
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slot ID</label>
            <input
              type="text"
              value={config.googleAdsense.slot}
              onChange={e => setConfig({ ...config, googleAdsense: { ...config.googleAdsense, slot: e.target.value } })}
              placeholder="1234567890"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </NeumorphBox>
      )}

      {config.provider === 'adsterra' && (
        <NeumorphBox title="Adsterra Configuration">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Script / Iframe Code</label>
            <textarea
              value={config.adsterra.script}
              onChange={e => setConfig({ ...config, adsterra: { ...config.adsterra, script: e.target.value } })}
              placeholder="Paste your Adsterra script or iframe code here..."
              className="w-full h-32 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              Be careful when pasting raw scripts. Ensure they are from a trusted source.
            </p>
          </div>
        </NeumorphBox>
      )}

      {config.provider === 'propellerads' && (
        <NeumorphBox title="PropellerAds Configuration">
           <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone ID</label>
            <input
              type="text"
              value={config.propellerads.zoneId}
              onChange={e => setConfig({ ...config, propellerads: { ...config.propellerads, zoneId: e.target.value } })}
              placeholder="Zone ID"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Script Code</label>
            <textarea
              value={config.propellerads.script}
              onChange={e => setConfig({ ...config, propellerads: { ...config.propellerads, script: e.target.value } })}
              placeholder="Paste your PropellerAds script here..."
              className="w-full h-32 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
            />
          </div>
        </NeumorphBox>
      )}
    </div>
  );
}
