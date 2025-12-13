import React from 'react';
import { Move, RotateCcw } from 'lucide-react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeuomorphSlider } from '@/components/ui/NeuomorphSlider';

interface AdjustImageControlProps {
  zoom: number;
  onZoomChange: (value: number) => void;
  onReset: () => void;
}

export function AdjustImageControl({ zoom, onZoomChange, onReset }: AdjustImageControlProps) {
  return (
    <NeumorphBox
      title="Adjust Image"
      variant="pressed"
      subtitle="Perfect your composition"
      badge={
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-600"
        >
          <RotateCcw size={12} /> Reset
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-300">
          <span>Zoom</span>
          <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="px-2">
          <NeuomorphSlider
            min={0.5}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(val) => {
              if (typeof val === 'number') {
                onZoomChange(val);
              }
            }}
            trackClassName="h-3"
          />
        </div>
      </div>
    </NeumorphBox>
  );
}
