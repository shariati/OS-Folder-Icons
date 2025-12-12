import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { ColorSelector } from '@/components/ui/ColorSelector';
import { NeumorphInput } from '@/components/ui/NeumorphInput';
import { Hash } from 'lucide-react';

interface NeumorphColorPickerProps {
  variant: 'simple' | 'advance';
  color: string;
  onChange: (color: string) => void;
  colors?: string[];
  title?: string;
}

export function NeumorphColorPicker({
  variant,
  color,
  onChange,
  colors = [],
  title,
}: NeumorphColorPickerProps) {
  if (variant === 'simple') {
    return (
      <ColorSelector
        title={title}
        mode="palette"
        colors={colors}
        value={color}
        onChange={onChange}
        shape="circle"
        animation="grow"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {title && (
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">{title}</label>
      )}
      <div className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <HexColorPicker
          color={color}
          onChange={onChange}
          style={{ width: '100%', height: '150px' }}
        />
      </div>
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 rounded-xl border border-gray-200 shadow-sm"
          style={{ backgroundColor: color }}
        />
        <div className="relative flex-1">
          <NeumorphInput
            iconPosition="left"
            value={color.replace(/^#/, '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value;
              onChange(val.startsWith('#') ? val : `#${val}`);
            }}
            containerClassName="w-full"
            className="neu-pressed"
            icon={<Hash className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
}
