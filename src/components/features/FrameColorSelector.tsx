import React from 'react';

import { ColorSelector } from '@/components/ui/ColorSelector';
import { NeumorphBox } from '@/components/ui/NeumorphBox';

export interface FrameColor {
  name: string;
  value: string;
  text: string;
}

interface FrameColorSelectorProps {
  colors: FrameColor[];
  selectedColor: FrameColor;
  onColorChange: (color: FrameColor) => void;
}

export function FrameColorSelector({
  colors,
  selectedColor,
  onColorChange,
}: FrameColorSelectorProps) {
  return (
    <NeumorphBox title="Frame Color" subtitle="Match your aesthetic">
      <ColorSelector
        mode="palette"
        variant="full"
        colors={colors.map((c) => ({
          value: c.value,
          label: c.name,
          color: c.value,
        }))}
        value={selectedColor.value}
        onChange={(val) => {
          const found = colors.find((c) => c.value === val);
          if (found) onColorChange(found);
        }}
        className="w-full"
      />
    </NeumorphBox>
  );
}
