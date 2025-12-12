import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeuomorphSlider } from '@/components/ui/NeuomorphSlider';
import { IconStylePresets } from './IconStylePresets';

interface AdvanceCustomizationProps {
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

export function AdvanceCustomization({
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
}: AdvanceCustomizationProps) {
  return (
    <NeumorphBox
      className="space-y-6 rounded-3xl p-6"
      title="Advance Customization"
      subtitle="Fine-tune your icon"
    >
      {/* Folder Color */}
      <div>
        <h3 className="mb-1 text-lg font-bold text-gray-700 dark:text-white">Folder Color</h3>
        <div className="mt-4">
          <NeuomorphSlider
            min={0}
            max={360}
            value={folderHue}
            onChange={(val) => onFolderHueChange(val as number)}
            trackClassName="bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
            fillClassName="hidden"
            className="w-full"
          />
        </div>
      </div>

      {/* Icon Style */}
      <IconStylePresets
        iconEffect={iconEffect}
        onSelectEffect={onIconEffectChange}
        variant="none"
      />

      {/* Opacity */}
      <div>
        <h3 className="mb-1 text-lg font-bold text-gray-700 dark:text-white">Icon Opacity</h3>
        <div className="mt-4">
          <NeuomorphSlider
            min={0}
            max={100}
            value={iconTransparency * 100}
            onChange={(val) => onIconTransparencyChange((val as number) / 100)}
            trackClassName="bg-gradient-to-r from-transparent to-gray-500 dark:to-gray-200"
            fillClassName="hidden"
          />
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
            <NeuomorphSlider
              min={-100}
              max={100}
              value={customOffsetX}
              onChange={(val) => onCustomOffsetXChange(val as number)}
            />
          </div>
          <div>
            <div className="mb-1 flex justify-between">
              <label className="text-xs font-bold text-gray-500">Vertical (Y)</label>
              <span className="text-xs text-gray-400">{customOffsetY}px</span>
            </div>
            <NeuomorphSlider
              min={-100}
              max={100}
              value={customOffsetY}
              onChange={(val) => onCustomOffsetYChange(val as number)}
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
