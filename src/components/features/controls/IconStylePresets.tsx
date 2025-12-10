import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeumorphButton } from '@/components/ui/NeumorphButton';
import { clsx } from 'clsx';

interface IconStylePresetsProps {
  iconEffect: 'none' | 'pressed' | 'emboss' | 'glassy';
  onSelectEffect: (effect: 'none' | 'pressed' | 'emboss' | 'glassy') => void;
}

export function IconStylePresets({ iconEffect, onSelectEffect }: IconStylePresetsProps) {
  return (
    <NeumorphBox 
      title="Icon Style"
      subtitle="Choose a preset style"
    >
      <div className="grid grid-cols-3 gap-3">
        {(['pressed', 'glassy', 'none', 'emboss'] as const).map(effect => (
            <NeumorphButton
              key={effect}
              onClick={() => onSelectEffect(effect)}
              variant={iconEffect === effect ? 'pressed' : 'neumorph'}
              isActive={iconEffect === effect}
              className="py-3 px-2 text-sm"
              size="sm"
              label={effect === 'none' ? 'Flat' : effect.charAt(0).toUpperCase() + effect.slice(1)}
            />
        ))}
      </div>
    </NeumorphBox>
  );
}
