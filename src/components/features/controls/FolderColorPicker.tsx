import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { ColorSelector } from '@/components/ui/ColorSelector';

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
        <ColorSelector
          mode="hue"
          colors={[0, 140, 180, 240, 300]}
          value={folderHue}
          onChange={onSelectHue}
          shape="rounded"
          animation="grow"
          baseColor="#3b82f6"
        />
    </NeumorphBox>
  );
}
