'use client';

import { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import * as HeroIcons from '@heroicons/react/24/solid';
import * as Unicons from '@iconscout/react-unicons';
import * as GrommetIcons from 'grommet-icons';
import { HexColorPicker } from 'react-colorful';
import { Search, Grid, Type, Shield } from 'lucide-react';
import { clsx } from 'clsx';

interface IconPickerProps {
  selectedIcon: string | null;
  onSelectIcon: (icon: string) => void;
  iconType: 'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons';
  onTypeChange: (type: 'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons') => void;
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

  // Get all Heroicons names
  const heroIconNames = useMemo(() => {
    return Object.keys(HeroIcons).filter(key => isNaN(Number(key)));
  }, []);

  // Get all Unicons names
  const uniconsIconNames = useMemo(() => {
    return Object.keys(Unicons).filter(key => isNaN(Number(key)));
  }, []);

  // Get all Grommet Icons names
  const grommetIconNames = useMemo(() => {
    return Object.keys(GrommetIcons).filter(key => isNaN(Number(key)) && key !== 'default' && key !== 'ThemeContext');
  }, []);

  const filteredIcons = useMemo(() => {
    let source: string[] = [];
    switch (iconType) {
      case 'lucide':
        source = lucideIconNames;
        break;
      case 'fontawesome':
        source = fontAwesomeIcons;
        break;
      case 'heroicons':
        source = heroIconNames;
        break;
      case 'unicons':
        source = uniconsIconNames;
        break;
      case 'grommet-icons':
        source = grommetIconNames;
        break;
    }

    if (!search) return source.slice(0, 100); // Limit initial display
    return source.filter(name => name.toLowerCase().includes(search.toLowerCase())).slice(0, 100);
  }, [lucideIconNames, heroIconNames, uniconsIconNames, grommetIconNames, search, iconType]);

  return (
    <div className="neu-flat p-6 rounded-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-700 dark:text-white">Icon Selection</h3>
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500">
          {filteredIcons.length} icons
        </span>
      </div>

      {/* Icon Source & Search - Only in Advanced Mode */}
      {mode === 'advanced' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-full">
            <button
              onClick={() => onTypeChange('lucide')}
              className={clsx(
                "flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 min-w-[100px]",
                iconType === 'lucide' 
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              <Grid size={14} />
              Lucide
            </button>
            <button
              onClick={() => onTypeChange('fontawesome')}
              className={clsx(
                "flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 min-w-[100px]",
                iconType === 'fontawesome' 
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              <Type size={14} />
              FontAwesome
            </button>
            <button
              onClick={() => onTypeChange('heroicons')}
              className={clsx(
                "flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 min-w-[100px]",
                iconType === 'heroicons' 
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              <Shield size={14} />
              Heroicons
            </button>
            <button
              onClick={() => onTypeChange('unicons')}
              className={clsx(
                "flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 min-w-[100px]",
                iconType === 'unicons' 
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              <span className="text-xs">Unicons</span>
            </button>
            <button
              onClick={() => onTypeChange('grommet-icons')}
              className={clsx(
                "flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 min-w-[100px]",
                iconType === 'grommet-icons' 
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              <span className="text-xs">Grommet</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent"
            />
          </div>
        </div>
      )}

      {/* Simple Mode Search (Just the input) */}
      {mode === 'simple' && (
         <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
               {/* Simple mode tabs for libraries */}
               {(['lucide', 'fontawesome', 'heroicons', 'unicons', 'grommet-icons'] as const).map(type => (
                 <button
                   key={type}
                   onClick={() => onTypeChange(type)}
                   className={clsx(
                     "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                     iconType === type
                       ? "bg-blue-600 text-white shadow-md"
                       : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                   )}
                 >
                   {type === 'grommet-icons' ? 'Grommet' : type.charAt(0).toUpperCase() + type.slice(1)}
                 </button>
               ))}
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl neu-pressed text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent"
              />
            </div>
          </div>
      )}

      {/* Icon Grid */}
      <div className="h-64 overflow-y-auto grid grid-cols-6 sm:grid-cols-6 gap-2 p-2 rounded-xl neu-pressed bg-gray-50/50 dark:bg-gray-900/30 custom-scrollbar">
        {filteredIcons.map((name) => {
          if (iconType === 'lucide') {
            const Icon = (LucideIcons as any)[name];
            if (!Icon) return null;
            return (
              <button
                key={name}
                onClick={() => onSelectIcon(name)}
                className={clsx(
                  "p-2 rounded-xl flex items-center justify-center transition-all aspect-square",
                  selectedIcon === name 
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40 transform scale-105" 
                    : "text-gray-500 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                )}
                title={name}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          } else if (iconType === 'fontawesome') {
            return (
              <button
                key={name}
                onClick={() => onSelectIcon(name)}
                className={clsx(
                  "p-2 rounded-xl flex items-center justify-center transition-all aspect-square",
                  selectedIcon === name 
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40 transform scale-105" 
                    : "text-gray-500 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                )}
                title={name}
              >
                <i className={clsx(name, "text-xl")} />
              </button>
            );
          } else if (iconType === 'heroicons') {
            const Icon = (HeroIcons as any)[name];
            if (!Icon) return null;
            return (
              <button
                key={name}
                onClick={() => onSelectIcon(name)}
                className={clsx(
                  "p-2 rounded-xl flex items-center justify-center transition-all aspect-square",
                  selectedIcon === name 
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40 transform scale-105" 
                    : "text-gray-500 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                )}
                title={name}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          } else if (iconType === 'unicons') {
            const Icon = (Unicons as any)[name];
            if (!Icon) return null;
            return (
              <button
                key={name}
                onClick={() => onSelectIcon(name)}
                className={clsx(
                  "p-2 rounded-xl flex items-center justify-center transition-all aspect-square",
                  selectedIcon === name 
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40 transform scale-105" 
                    : "text-gray-500 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                )}
                title={name}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          } else if (iconType === 'grommet-icons') {
            const Icon = (GrommetIcons as any)[name];
            if (!Icon) return null;
            return (
              <button
                key={name}
                onClick={() => onSelectIcon(name)}
                className={clsx(
                  "p-2 rounded-xl flex items-center justify-center transition-all aspect-square",
                  selectedIcon === name 
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40 transform scale-105" 
                    : "text-gray-500 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                )}
                title={name}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          }
          return null;
        })}
      </div>

      {/* Customization Controls */}
      <div className="grid grid-cols-1 gap-6">
        {/* Color Picker */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Icon Color</label>
          
          {mode === 'simple' ? (
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map(preset => (
                <button
                  key={preset}
                  onClick={() => onColorChange(preset)}
                  className={clsx(
                    "w-8 h-8 rounded-full shadow-sm transition-transform hover:scale-110 border-2",
                    color === preset ? "border-blue-500 scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: preset }}
                  title={preset}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <HexColorPicker color={color} onChange={onColorChange} style={{ width: '100%', height: '150px' }} />
              </div>
              <div className="flex items-center gap-3">
                 <div 
                   className="w-10 h-10 rounded-xl border border-gray-200 shadow-sm"
                   style={{ backgroundColor: color }}
                 />
                 <div className="flex-1 relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">HEX</span>
                   <input 
                     type="text" 
                     value={color} 
                     onChange={(e) => onColorChange(e.target.value)}
                     className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Size Control */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Icon Size</label>
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {(['small', 'medium', 'large'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onSizeChange(s)}
                className={clsx(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all",
                  size === s
                    ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
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
