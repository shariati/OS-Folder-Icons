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
      if (OS_KEYWORD_MATCHERS.ICNS.some((k) => name.toLowerCase().includes(k))) {
        setFormat(OS_FORMATS.ICNS);
      } else if (OS_KEYWORD_MATCHERS.ICO.some((k) => name.toLowerCase().includes(k))) {
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
      className="animate-in fade-in zoom-in-95 mx-auto max-w-2xl p-6 duration-200 sm:p-8"
      title={title}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
              Name
            </label>
            <NeumorphBox
              as="input"
              variant="pressed"
              type="text"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              className="w-full rounded-xl bg-transparent px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
              placeholder="e.g. macOS Sequoia"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
              Format
            </label>
            <div className="relative">
              <NeumorphBox
                as="select"
                variant="pressed"
                value={format}
                onChange={(e: any) => setFormat(e.target.value as any)}
                className="w-full appearance-none rounded-xl bg-transparent px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
              >
                <option value={OS_FORMATS.PNG}>PNG</option>
                <option value={OS_FORMATS.ICO}>ICO</option>
                <option value={OS_FORMATS.ICNS}>ICNS</option>
              </NeumorphBox>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
              Brand Icon
            </label>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {BRAND_ICONS.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => setBrandIcon(icon.class)}
                  className={clsx(
                    'flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 p-2 transition-all',
                    brandIcon === icon.class
                      ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  )}
                >
                  <i className={clsx(icon.class, 'text-xl')} />
                  <span className="w-full truncate text-center text-[10px] font-bold">
                    {icon.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-6 py-2.5 font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name}
            className="rounded-xl bg-blue-600 px-8 py-2.5 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Operating System'}
          </button>
        </div>
      </form>
    </NeumorphBox>
  );
}
