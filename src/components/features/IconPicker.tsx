'use client';

import { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import * as HeroIcons from '@heroicons/react/24/solid';
import * as Unicons from '@iconscout/react-unicons';
import * as GrommetIcons from 'grommet-icons';
import { HexColorPicker } from 'react-colorful';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeumorphIconGrid } from '@/components/ui/NeumorphIconGrid';
import { ColorSelector } from '@/components/ui/ColorSelector';
import { NeumorphToggleGroup } from '@/components/ui/NeumorphToggleGroup';
import { NeumorphInput } from '@/components/ui/NeumorphInput';

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
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
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
        <NeumorphInput
          type="text"
          placeholder="Search icons..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
          iconPosition="left"
          className="w-full bg-transparent focus:ring-2 focus:ring-blue-500/50"
        />
      </div>
      {/* Icon Grid */}
      {/* Icon Grid */}
      <NeumorphIconGrid
        variant="pressed"
        icons={filteredIcons}
        selectedIcon={selectedIcon}
        onSelect={onSelectIcon}
        gridSize={6}
        gridSizeSm={6}
        renderIcon={(name) => {
          if (iconType === 'lucide') {
            const Icon = (LucideIcons as any)[name];
            return Icon ? <Icon className="h-6 w-6" /> : null;
          } else if (iconType === 'fontawesome') {
            return <i className={clsx(name, 'text-xl')} />;
          } else if (iconType === 'heroicons') {
            const Icon = (HeroIcons as any)[name];
            return Icon ? <Icon className="h-6 w-6" /> : null;
          } else if (iconType === 'unicons') {
            const Icon = (Unicons as any)[name];
            return Icon ? <Icon className="h-6 w-6" /> : null;
          } else if (iconType === 'grommet-icons') {
            const Icon = (GrommetIcons as any)[name];
            return Icon ? <Icon className="h-6 w-6" /> : null;
          }
          return null;
        }}
      />

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
        <NeumorphToggleGroup
          title="Icon Size"
          variant="none"
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
