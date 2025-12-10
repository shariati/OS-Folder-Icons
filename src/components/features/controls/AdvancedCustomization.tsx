import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { clsx } from 'clsx';

interface AdvancedCustomizationProps {
  folderHue: number;
  onFolderHueChange: (hue: number) => void;
  iconEffect: 'none' | 'carved' | 'emboss' | 'glassy';
  onIconEffectChange: (effect: 'none' | 'carved' | 'emboss' | 'glassy') => void;
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
      className="p-6 rounded-3xl space-y-6"
      title="Advanced Customization"
      subtitle="Fine-tune your icon"
    >
      
      {/* Folder Color */}
      <div>
       <h3 className="text-lg font-bold mb-1 text-gray-700 dark:text-white">Folder Color</h3>
        <div className="flex items-center gap-4 mt-4">
          <input
            type="range"
            min="0"
            max="360"
            value={folderHue}
            onChange={(e) => onFolderHueChange(parseInt(e.target.value))}
            className="w-full h-4 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full appearance-none cursor-pointer shadow-inner"
          />
          <span className="text-xs font-mono w-12 text-right text-gray-500">{folderHue}°</span>
        </div>
      </div>

      {/* Icon Effect */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-white">Icon Effect</h3>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {(['none', 'carved', 'emboss', 'glassy'] as const).map(effect => (
            <button
              key={effect}
              onClick={() => onIconEffectChange(effect)}
              className={clsx(
                "flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all capitalize",
                iconEffect === effect
                  ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              )}
            >
              {effect}
            </button>
          ))}
        </div>
      </div>

      {/* Transparency */}
      <div>
        <h3 className="text-lg font-bold mb-1 text-gray-700 dark:text-white">Icon Transparency</h3>
        <div className="flex items-center gap-4 mt-4">
          <input
            type="range"
            min="0"
            max="100"
            value={iconTransparency * 100}
            onChange={(e) => onIconTransparencyChange(parseInt(e.target.value) / 100)}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-xs font-mono w-12 text-right text-gray-500">{Math.round(iconTransparency * 100)}%</span>
        </div>
      </div>

      {/* Position Adjustment */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-white">Position</h3>
        <NeumorphBox variant="pressed" className="space-y-4 p-4 rounded-xl">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-bold text-gray-500">Horizontal (X)</label>
              <span className="text-xs text-gray-400">{customOffsetX}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={customOffsetX}
              onChange={(e) => onCustomOffsetXChange(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div>
             <div className="flex justify-between mb-1">
              <label className="text-xs font-bold text-gray-500">Vertical (Y)</label>
              <span className="text-xs text-gray-400">{customOffsetY}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={customOffsetY}
              onChange={(e) => onCustomOffsetYChange(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <button 
            onClick={() => { onCustomOffsetXChange(0); onCustomOffsetYChange(0); }}
            className="text-xs text-blue-500 hover:text-blue-600 font-bold w-full text-center mt-2"
          >
            Reset Position
          </button>
        </NeumorphBox>
      </div>
    </NeumorphBox>
  );
}
