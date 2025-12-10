import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { clsx } from 'clsx';

interface IconStylePresetsProps {
  iconEffect: 'none' | 'carved' | 'emboss' | 'glassy';
  onSelectEffect: (effect: 'none' | 'carved' | 'emboss' | 'glassy') => void;
}

export function IconStylePresets({ iconEffect, onSelectEffect }: IconStylePresetsProps) {
  return (
    <NeumorphBox 
      title="Icon Style"
      subtitle="Choose a preset style"
    >
      <div className="grid grid-cols-3 gap-3">
        {(['carved', 'glassy', 'none'] as const).map(effect => (
          <NeumorphBox
            as="button"
            key={effect}
            onClick={() => onSelectEffect(effect)}
            variant={iconEffect === effect ? 'pressed' : 'flat'}
            className={clsx(
              "py-3 px-2 rounded-xl text-sm font-bold transition-all",
              iconEffect === effect
                ? "text-blue-600"
                : "text-gray-600 dark:text-gray-300 hover:-translate-y-0.5"
            )}
          >
            {effect === 'none' ? 'Flat' : effect.charAt(0).toUpperCase() + effect.slice(1)}
          </NeumorphBox>
        ))}
      </div>
    </NeumorphBox>
  );
}
