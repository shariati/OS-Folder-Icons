import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeumorphToggleGroup } from '@/components/ui/NeumorphToggleGroup';
import { toCapitalCase } from '@/lib/format';
import { clsx } from 'clsx';

interface IconStylePresetsProps {
  iconEffect: 'raised' | 'sunken' | 'glass' | 'flat';
  onSelectEffect: (effect: 'raised' | 'sunken' | 'glass' | 'flat') => void;
  variant?: 'flat' | 'pressed' | 'none';
}

export function IconStylePresets({
  iconEffect,
  onSelectEffect,
  variant = 'flat',
}: IconStylePresetsProps) {
  return (
    <NeumorphBox title="Icon Style" subtitle="Choose a preset style" variant={variant}>
      <NeumorphToggleGroup
        items={(['sunken', 'raised', 'glass', 'flat'] as const).map((effect) => ({
          value: effect,
          label: toCapitalCase(effect),
        }))}
        value={iconEffect}
        onChange={(val) => onSelectEffect(val as 'raised' | 'sunken' | 'glass' | 'flat')}
        variant="none"
        gridSize={3}
        className="gap-3"
        size="sm"
      />
    </NeumorphBox>
  );
}
