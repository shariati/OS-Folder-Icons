import { NeumorphBox } from '@/components/ui/NeumorphBox';
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
          <NeumorphBox
            as="button"
            key={os.id}
            onClick={() => onSelectOS(os.id)}
            variant={selectedOSId === os.id ? 'pressed' : 'flat'}
            className={clsx(
              "space-y-0 flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all duration-200",
              selectedOSId === os.id
                ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                : "hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
            )}
          >
            {os.brandIcon ? (
              <i className={clsx(os.brandIcon, "text-4xl")} />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {os.name.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{os.name}</span>
          </NeumorphBox>
        ))}
      </div>
    </NeumorphBox>
  );
}
