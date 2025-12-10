'use client';

import { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import * as HeroIcons from '@heroicons/react/24/solid';
import * as Unicons from '@iconscout/react-unicons';
import * as GrommetIcons from 'grommet-icons';
import { HexColorPicker } from 'react-colorful';
import { Search, Grid, Type, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { ColorSelector } from '@/components/ui/ColorSelector';
import { ToggleGroup } from '@/components/ui/ToggleGroup';

interface IconPickerProps {
  selectedIcon: string | null;
  onSelectIcon: (icon: string) => void;
  iconType: 'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons';
  onTypeChange: (
    type: 'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons'
  ) => void;
  color: string;
  onColorChange: (color: string) => void;
  size: 'small' | 'medium' | 'large';
  onSizeChange: (size: 'small' | 'medium' | 'large') => void;
  mode?: 'simple' | 'advanced';
}

import { fontAwesomeIcons } from '@/data/fontAwesomeIcons';

const PRESET_COLORS = [
  '#000000',
  '#FFFFFF',
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#84CC16',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#D946EF',
  '#F43F5E',
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
  mode = 'simple',
}: IconPickerProps) {
  const [search, setSearch] = useState('');

  // Get all Lucide icon names
  const lucideIconNames = useMemo(() => {
    return Object.keys(LucideIcons).filter(
      (key) => key !== 'icons' && key !== 'createLucideIcon' && isNaN(Number(key))
    );
  }, []);

  // Get all Heroicons names
  const heroIconNames = useMemo(() => {
    return Object.keys(HeroIcons).filter((key) => isNaN(Number(key)));
  }, []);

  // Get all Unicons names
  const uniconsIconNames = useMemo(() => {
    return Object.keys(Unicons).filter((key) => isNaN(Number(key)));
  }, []);

  // Get all Grommet Icons names
  const grommetIconNames = useMemo(() => {
    return Object.keys(GrommetIcons).filter(
      (key) => isNaN(Number(key)) && key !== 'default' && key !== 'ThemeContext'
    );
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
    return source.filter((name) => name.toLowerCase().includes(search.toLowerCase())).slice(0, 100);
  }, [lucideIconNames, heroIconNames, uniconsIconNames, grommetIconNames, search, iconType]);

  return (
    <NeumorphBox
      title="Icon Selection"
      subtitle="Pick your symbol"
      badge={
        <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 dark:bg-gray-700">
          {filteredIcons.length} icons
        </span>
      }
    >
      {/* Icon Source & Search - Only in Advanced Mode */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
        {/* Simple mode tabs for libraries */}
        {(['lucide', 'fontawesome', 'heroicons', 'unicons', 'grommet-icons'] as const).map(
          (type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={clsx(
                'whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all',
                iconType === type
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              {type === 'grommet-icons' ? 'Grommet' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          )
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <NeumorphBox
            as="input"
            variant="pressed"
            type="text"
            placeholder="Search icons..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
          />
        </div>
      </div>
      {/* Icon Grid */}
      <NeumorphBox
        variant="pressed"
        className="custom-scrollbar grid h-64 grid-cols-6 gap-2 overflow-y-auto rounded-xl bg-gray-50/50 p-2 sm:grid-cols-6 dark:bg-gray-900/30"
      >
        {filteredIcons.map((name) => {
          if (iconType === 'lucide') {
            const Icon = (LucideIcons as any)[name];
            if (!Icon) return null;
            return (
              <button
                key={name}
                onClick={() => onSelectIcon(name)}
                className={clsx(
                  'flex aspect-square items-center justify-center rounded-xl p-2 transition-all',
                  selectedIcon === name
                    ? 'scale-105 transform bg-blue-500 text-white shadow-lg shadow-blue-500/40'
                    : 'text-gray-500 hover:bg-white hover:shadow-sm dark:hover:bg-gray-700'
                )}
                title={name}
              >
                <Icon className="h-6 w-6" />
              </button>
            );
          } else if (iconType === 'fontawesome') {
            return (
              <button
                key={name}
                onClick={() => onSelectIcon(name)}
                className={clsx(
                  'flex aspect-square items-center justify-center rounded-xl p-2 transition-all',
                  selectedIcon === name
                    ? 'scale-105 transform bg-blue-500 text-white shadow-lg shadow-blue-500/40'
                    : 'text-gray-500 hover:bg-white hover:shadow-sm dark:hover:bg-gray-700'
                )}
                title={name}
              >
                <i className={clsx(name, 'text-xl')} />
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
                  'flex aspect-square items-center justify-center rounded-xl p-2 transition-all',
                  selectedIcon === name
                    ? 'scale-105 transform bg-blue-500 text-white shadow-lg shadow-blue-500/40'
                    : 'text-gray-500 hover:bg-white hover:shadow-sm dark:hover:bg-gray-700'
                )}
                title={name}
              >
                <Icon className="h-6 w-6" />
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
                  'flex aspect-square items-center justify-center rounded-xl p-2 transition-all',
                  selectedIcon === name
                    ? 'scale-105 transform bg-blue-500 text-white shadow-lg shadow-blue-500/40'
                    : 'text-gray-500 hover:bg-white hover:shadow-sm dark:hover:bg-gray-700'
                )}
                title={name}
              >
                <Icon className="h-6 w-6" />
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
                  'flex aspect-square items-center justify-center rounded-xl p-2 transition-all',
                  selectedIcon === name
                    ? 'scale-105 transform bg-blue-500 text-white shadow-lg shadow-blue-500/40'
                    : 'text-gray-500 hover:bg-white hover:shadow-sm dark:hover:bg-gray-700'
                )}
                title={name}
              >
                <Icon className="h-6 w-6" />
              </button>
            );
          }
          return null;
        })}
      </NeumorphBox>

      {/* Customization Controls */}
      <div className="grid grid-cols-1 gap-6">
        {/* Color Picker */}
        <div className="space-y-3">
          {mode === 'simple' ? (
            <ColorSelector
              title="Icon Color"
              mode="palette"
              colors={PRESET_COLORS}
              value={color}
              onChange={onColorChange}
              shape="circle"
              animation="grow"
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <HexColorPicker
                  color={color}
                  onChange={onColorChange}
                  style={{ width: '100%', height: '150px' }}
                />
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    HEX
                  </span>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-full rounded-lg border bg-gray-50 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Size Control */}
        <ToggleGroup
          title="Icon Size"
          variant="pressed"
          padding="p-4"
          items={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ]}
          value={size}
          onChange={(val) => onSizeChange(val as 'small' | 'medium' | 'large')}
        />
      </div>
    </NeumorphBox>
  );
}
