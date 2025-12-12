'use client';

import { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import * as HeroIcons from '@heroicons/react/24/solid';
import * as Unicons from '@iconscout/react-unicons';
import * as GrommetIcons from 'grommet-icons';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeumorphIconGrid } from '@/components/ui/NeumorphIconGrid';
import { NeumorphToggleGroup } from '@/components/ui/NeumorphToggleGroup';
import { NeumorphInput } from '@/components/ui/NeumorphInput';
import { NeumorphColorPicker } from './NeumorphColorPicker';

interface IconPickerProps {
  selectedIcon: string | null;
  onSelectIcon: (icon: string) => void;
  iconType: 'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons';
  onTypeChange: (
    type: 'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons'
  ) => void;
  color: string;
  onColorChange: (color: string) => void;
  size: 'sm' | 'md' | 'lg';
  onSizeChange: (size: 'sm' | 'md' | 'lg') => void;
  mode?: 'simple' | 'advance';
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
      <NeumorphToggleGroup
        items={(['lucide', 'fontawesome', 'heroicons', 'unicons', 'grommet-icons'] as const).map(
          (type) => ({
            value: type,
            label:
              type === 'grommet-icons' ? 'Grommet' : type.charAt(0).toUpperCase() + type.slice(1),
          })
        )}
        value={iconType}
        onChange={(val) =>
          onTypeChange(val as 'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons')
        }
        variant="none"
        size="sm"
        padding="p-6"
        className="scrollbar-hide overflow-x-auto"
      />

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
          <NeumorphColorPicker
            variant={mode}
            color={color}
            onChange={onColorChange}
            colors={PRESET_COLORS}
            title="Icon Color"
          />
        </div>

        {/* Size Control */}
        <NeumorphToggleGroup
          title="Icon Size"
          variant="none"
          items={[
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
          ]}
          value={size}
          onChange={(val) => onSizeChange(val as 'sm' | 'md' | 'lg')}
        />
      </div>
    </NeumorphBox>
  );
}
