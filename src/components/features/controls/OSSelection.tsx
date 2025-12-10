import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { ToggleGroup } from '@/components/ui/ToggleGroup';
import { OperatingSystem } from '@/lib/types';
import { clsx } from 'clsx';

interface OSSelectionProps {
  operatingSystems: OperatingSystem[];
  selectedOSId: string;
  onSelectOS: (osId: string) => void;
}

export function OSSelection({ operatingSystems, selectedOSId, onSelectOS }: OSSelectionProps) {
  return (
    <NeumorphBox title="Operating System" subtitle="Select your platform">
      <ToggleGroup
        items={operatingSystems.map((os) => ({
          value: os.id,
          label: os.name,
          icon: os.brandIcon ? (
            <i className={clsx(os.brandIcon, 'text-2xl')} />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
              {os.name.charAt(0)}
            </div>
          ),
        }))}
        value={selectedOSId}
        onChange={onSelectOS}
        variant="none"
        gridSize={2}
        className="gap-4"
        size="lg"
      />
    </NeumorphBox>
  );
}
