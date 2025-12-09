'use client';

import { useState, useEffect } from 'react';
import { OperatingSystem } from '@/lib/types';
import { OS_FORMATS, BRAND_ICONS, OS_KEYWORD_MATCHERS } from '@/constants/os';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface OSFormProps {
  initialData?: Partial<OperatingSystem>;
  onSubmit: (data: Partial<OperatingSystem>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  title: string;
}

export function OSForm({ initialData, onSubmit, onCancel, isSubmitting, title }: OSFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [format, setFormat] = useState<'png' | 'ico' | 'icns'>(initialData?.format || 'png');
  const [brandIcon, setBrandIcon] = useState(initialData?.brandIcon || '');

  // Auto-detect format based on name if creating new
  useEffect(() => {
    if (!initialData?.id) {
      if (OS_KEYWORD_MATCHERS.ICNS.some(k => name.toLowerCase().includes(k))) {
        setFormat(OS_FORMATS.ICNS);
      } else if (OS_KEYWORD_MATCHERS.ICO.some(k => name.toLowerCase().includes(k))) {
        setFormat(OS_FORMATS.ICO);
      }
    }
  }, [name, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      format,
      brandIcon,
    });
  };

  return (
    <NeumorphBox 
      className="animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8 max-w-2xl mx-auto"
      title={title}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <NeumorphBox
              as="input"
              variant="pressed"
              type="text"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent"
              placeholder="e.g. macOS Sequoia"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Format</label>
            <div className="relative">
              <NeumorphBox
                as="select"
                variant="pressed"
                value={format}
                onChange={(e: any) => setFormat(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent appearance-none"
              >
                <option value={OS_FORMATS.PNG}>PNG</option>
                <option value={OS_FORMATS.ICO}>ICO</option>
                <option value={OS_FORMATS.ICNS}>ICNS</option>
              </NeumorphBox>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Brand Icon</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {BRAND_ICONS.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => setBrandIcon(icon.class)}
                  className={clsx(
                    "aspect-square p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1",
                    brandIcon === icon.class
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500"
                  )}
                >
                  <i className={clsx(icon.class, "text-xl")} />
                  <span className="text-[10px] font-bold truncate w-full text-center">{icon.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name}
            className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
          >
            {isSubmitting ? 'Saving...' : 'Save Operating System'}
          </button>
        </div>
      </form>
    </NeumorphBox>
  );
}
