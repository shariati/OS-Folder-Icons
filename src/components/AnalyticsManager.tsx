'use client';

import { useState } from 'react';
import { DB, Settings } from '@/lib/types';
import { saveSettingsAction } from '@/app/admin/actions';
import { useToast } from '@/components/Toast';
import { Save, BarChart2, ExternalLink } from 'lucide-react';

interface AnalyticsManagerProps {
  initialData: DB;
}

export function AnalyticsManager({ initialData }: AnalyticsManagerProps) {
  const [measurementId, setMeasurementId] = useState(initialData.settings?.gaMeasurementId || '');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const newSettings: Settings = {
        ...initialData.settings,
        gaMeasurementId: measurementId,
      };
      await saveSettingsAction(newSettings);
      showToast('Analytics settings saved', 'success');
    } catch (error) {
      console.error('Error saving analytics settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div className="flex flex-col gap-9">
        {/* <!-- GA Configuration --> */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Google Analytics Configuration
            </h3>
          </div>
          <div className="p-6.5">
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Measurement ID (G-XXXXXXXXXX)
              </label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={measurementId}
                onChange={(e) => setMeasurementId(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              {isLoading ? 'Saving...' : (
                <span className="flex items-center gap-2">
                  <Save size={20} />
                  Save Configuration
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-9">
        {/* <!-- Dashboard Link --> */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Analytics Dashboard
            </h3>
          </div>
          <div className="p-6.5">
            <p className="mb-4 text-sm text-black dark:text-white">
              View your detailed analytics on the Google Analytics dashboard.
            </p>
            
            <a
              href="https://analytics.google.com/analytics/web/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full justify-center rounded border border-primary p-3 font-medium text-primary hover:bg-opacity-90 hover:text-white hover:bg-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink size={20} />
                Open Google Analytics
              </span>
            </a>

            <div className="mt-6 flex items-center justify-center text-gray-400">
               <BarChart2 size={64} className="opacity-20" />
            </div>
            <p className="mt-2 text-center text-xs text-gray-400">
              Live charts integration requires backend API setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
