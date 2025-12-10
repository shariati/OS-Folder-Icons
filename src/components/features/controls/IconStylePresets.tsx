import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeumorphButton } from '@/components/ui/NeumorphButton';
import { toCapitalCase } from '@/lib/format';
import { clsx } from 'clsx';

interface IconStylePresetsProps {
  iconEffect: 'raised' | 'sunken' | 'glass' | 'flat';
  onSelectEffect: (effect: 'raised' | 'sunken' | 'glass' | 'flat') => void;
}

export function IconStylePresets({ iconEffect, onSelectEffect }: IconStylePresetsProps) {
  return (
    <NeumorphBox title="Icon Style" subtitle="Choose a preset style">
      <div className="grid grid-cols-3 gap-3">
        {(['sunken', 'raised', 'glass', 'flat'] as const).map((effect) => (
          <NeumorphButton
            key={effect}
            onClick={() => onSelectEffect(effect)}
            isActive={iconEffect === effect}
            className="px-2 py-3 text-sm"
            size="sm"
            label={toCapitalCase(effect)}
          />
        ))}
      </div>
    </NeumorphBox>
  );
}
