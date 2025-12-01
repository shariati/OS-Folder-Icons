'use client';

import { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';

interface IconPickerProps {
  selectedIcon: string | null;
  onSelectIcon: (icon: string) => void;
  iconType: 'lucide' | 'fontawesome';
  onTypeChange: (type: 'lucide' | 'fontawesome') => void;
  color: string;
  onColorChange: (color: string) => void;
  size: 'small' | 'medium' | 'large';
  onSizeChange: (size: 'small' | 'medium' | 'large') => void;
  mode?: 'simple' | 'advanced';
}

import { fontAwesomeIcons } from '@/data/fontAwesomeIcons';

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E'
];

export function IconPicker({
  selectedIcon,
  onSelectIcon,
  iconType,
  onTypeChange,
  color,
  onColorChange,
  size,
  onSizeChange,
  mode = 'simple'
}: IconPickerProps) {
  const [search, setSearch] = useState('');

  // Get all Lucide icon names
  const lucideIconNames = useMemo(() => {
    return Object.keys(LucideIcons).filter(key => key !== 'icons' && key !== 'createLucideIcon' && isNaN(Number(key)));
  }, []);

  const filteredIcons = useMemo(() => {
    const source = iconType === 'lucide' ? lucideIconNames : fontAwesomeIcons;
    if (!search) return source.slice(0, 100); // Limit initial display
    return source.filter(name => name.toLowerCase().includes(search.toLowerCase())).slice(0, 100);
  }, [lucideIconNames, search, iconType]);

  return (
    <div className="space-y-6">
      {/* Icon Source & Search - Only in Advanced Mode */}
      {mode === 'advanced' && (
        <div className="space-y-3">
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
            <button
              onClick={() => onTypeChange('lucide')}
              className={clsx(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                iconType === 'lucide' ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              Lucide Icons
            </button>
            <button
              onClick={() => onTypeChange('fontawesome')}
              className={clsx(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                iconType === 'fontawesome' ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              FontAwesome
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Simple Mode Search (Just the input) */}
      {mode === 'simple' && (
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
      )}

      {/* Icon Grid */}
      <div className="h-64 overflow-y-auto grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
        {filteredIcons.map((name) => {
          if (iconType === 'lucide') {
            const Icon = (LucideIcons as any)[name];
            if (!Icon) return null;
            return (
              <button
                key={name}
                onClick={() => onSelectIcon(name)}
                className={clsx(
                  "p-2 rounded-md flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all aspect-square",
                  selectedIcon === name ? "bg-blue-100 dark:bg-blue-900 text-blue-600" : "text-gray-600 dark:text-gray-400"
                )}
                title={name}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          } else {
            return (
              <button
                key={name}
                onClick={() => onSelectIcon(name)}
                className={clsx(
                  "p-2 rounded-md flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all aspect-square",
                  selectedIcon === name ? "bg-blue-100 dark:bg-blue-900 text-blue-600" : "text-gray-600 dark:text-gray-400"
                )}
                title={name}
              >
                <i className={clsx(name, "text-xl")} />
              </button>
            );
          }
        })}
      </div>

      {/* Customization Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Color Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Icon Color</label>
          
          {mode === 'simple' ? (
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(preset => (
                <button
                  key={preset}
                  onClick={() => onColorChange(preset)}
                  className={clsx(
                    "w-8 h-8 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110",
                    color === preset && "ring-2 ring-blue-500 ring-offset-2"
                  )}
                  style={{ backgroundColor: preset }}
                  title={preset}
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-4">
              <HexColorPicker color={color} onChange={onColorChange} style={{ width: '100%', height: '150px' }} />
              <div className="space-y-2">
                 <div 
                   className="w-10 h-10 rounded-full border border-gray-200 shadow-sm"
                   style={{ backgroundColor: color }}
                 />
                 <input 
                   type="text" 
                   value={color} 
                   onChange={(e) => onColorChange(e.target.value)}
                   className="w-20 px-2 py-1 text-xs border rounded"
                 />
              </div>
            </div>
          )}
        </div>

        {/* Size Control - Available in BOTH modes now */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Icon Size</label>
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onSizeChange(s)}
                className={clsx(
                  "flex-1 py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all",
                  size === s
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
