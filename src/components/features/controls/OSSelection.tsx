import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeumorphButton } from '@/components/ui/NeumorphButton';
import { OperatingSystem } from '@/lib/types';
import { clsx } from 'clsx';

interface OSSelectionProps {
  operatingSystems: OperatingSystem[];
  selectedOSId: string;
  onSelectOS: (osId: string) => void;
}

export function OSSelection({ operatingSystems, selectedOSId, onSelectOS }: OSSelectionProps) {
  return (
    <NeumorphBox 
      title="Operating System"
      subtitle="Select your platform"
    >
      <div className="grid grid-cols-2 gap-4">
        {operatingSystems.map(os => (
          <NeumorphButton
            key={os.id}
            onClick={() => onSelectOS(os.id)}
            variant={selectedOSId === os.id ? 'pressed' : 'neumorph'}
            isActive={selectedOSId === os.id}
            orientation="vertical"
            className="p-4"
            label={os.name}
            icon={os.brandIcon ? (
              <i className={clsx(os.brandIcon, "text-4xl mb-2")} />
            ) : (
              <div className="w-8 h-8 mb-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {os.name.charAt(0)}
              </div>
            )}
          />
        ))}
      </div>
    </NeumorphBox>
  );
}

