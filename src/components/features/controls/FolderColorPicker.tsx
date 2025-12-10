import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { clsx } from 'clsx';

interface FolderColorPickerProps {
  folderHue: number;
  onSelectHue: (hue: number) => void;
}

export function FolderColorPicker({ folderHue, onSelectHue }: FolderColorPickerProps) {
  return (
    <NeumorphBox 
      title="Folder Color"
      subtitle="Colorize your folder"
    >
        <div className="flex flex-wrap gap-3">
          {[0, 140, 180, 240, 300].map(hue => (
            <button
              key={hue}
              onClick={() => onSelectHue(hue)}
              className={clsx(
                "w-12 h-12 rounded-xl transition-all shadow-sm border-2",
                folderHue === hue 
                  ? "border-blue-500 scale-110 shadow-md" 
                  : "border-transparent hover:scale-105"
              )}
              style={{ 
                backgroundColor: '#3b82f6', // Base blue color
                filter: `hue-rotate(${hue}deg)` 
              }}
              title={`Hue: ${hue}°`}
            />
          ))}
      </div>
    </NeumorphBox>
  );
}
