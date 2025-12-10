import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { clsx } from 'clsx';

interface AdvancedCustomizationProps {
  folderHue: number;
  onFolderHueChange: (hue: number) => void;
  iconEffect: 'raised' | 'sunken' | 'glass' | 'flat';
  onIconEffectChange: (effect: 'raised' | 'sunken' | 'glass' | 'flat') => void;
  iconTransparency: number;
  onIconTransparencyChange: (transparency: number) => void;
  customOffsetX: number;
  onCustomOffsetXChange: (offset: number) => void;
  customOffsetY: number;
  onCustomOffsetYChange: (offset: number) => void;
}

export function AdvancedCustomization({
  folderHue,
  onFolderHueChange,
  iconEffect,
  onIconEffectChange,
  iconTransparency,
  onIconTransparencyChange,
  customOffsetX,
  onCustomOffsetXChange,
  customOffsetY,
  onCustomOffsetYChange,
}: AdvancedCustomizationProps) {
  return (
    <NeumorphBox
      className="space-y-6 rounded-3xl p-6"
      title="Advanced Customization"
      subtitle="Fine-tune your icon"
    >
      {/* Folder Color */}
      <div>
        <h3 className="mb-1 text-lg font-bold text-gray-700 dark:text-white">Folder Color</h3>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="360"
            value={folderHue}
            onChange={(e) => onFolderHueChange(parseInt(e.target.value))}
            className="h-4 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 shadow-inner"
          />
          <span className="w-12 text-right font-mono text-xs text-gray-500">{folderHue}°</span>
        </div>
      </div>

      {/* Icon Effect */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-gray-700 dark:text-white">Icon Effect</h3>
        <div className="flex gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          {(['sunken', 'raised', 'glass', 'flat'] as const).map((effect) => (
            <button
              key={effect}
              onClick={() => onIconEffectChange(effect)}
              className={clsx(
                'flex-1 rounded-lg px-2 py-2 text-xs font-bold capitalize transition-all',
                iconEffect === effect
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              )}
            >
              {effect}
            </button>
          ))}
        </div>
      </div>

      {/* Transparency */}
      <div>
        <h3 className="mb-1 text-lg font-bold text-gray-700 dark:text-white">Icon Transparency</h3>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={iconTransparency * 100}
            onChange={(e) => onIconTransparencyChange(parseInt(e.target.value) / 100)}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-500 dark:bg-gray-700"
          />
          <span className="w-12 text-right font-mono text-xs text-gray-500">
            {Math.round(iconTransparency * 100)}%
          </span>
        </div>
      </div>

      {/* Position Adjustment */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-gray-700 dark:text-white">Position</h3>
        <NeumorphBox variant="pressed" className="space-y-4 rounded-xl p-4">
          <div>
            <div className="mb-1 flex justify-between">
              <label className="text-xs font-bold text-gray-500">Horizontal (X)</label>
              <span className="text-xs text-gray-400">{customOffsetX}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={customOffsetX}
              onChange={(e) => onCustomOffsetXChange(parseInt(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-blue-500 dark:bg-gray-600"
            />
          </div>
          <div>
            <div className="mb-1 flex justify-between">
              <label className="text-xs font-bold text-gray-500">Vertical (Y)</label>
              <span className="text-xs text-gray-400">{customOffsetY}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={customOffsetY}
              onChange={(e) => onCustomOffsetYChange(parseInt(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-blue-500 dark:bg-gray-600"
            />
          </div>
          <button
            onClick={() => {
              onCustomOffsetXChange(0);
              onCustomOffsetYChange(0);
            }}
            className="mt-2 w-full text-center text-xs font-bold text-blue-500 hover:text-blue-600"
          >
            Reset Position
          </button>
        </NeumorphBox>
      </div>
    </NeumorphBox>
  );
}
