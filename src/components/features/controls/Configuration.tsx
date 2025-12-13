import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeumorphDropdownList } from '@/components/ui/NeumorphDropdownList';
import { NeumorphToggleGroup } from '@/components/ui/NeumorphToggleGroup';
import { OperatingSystem, OSVersion } from '@/lib/types';

interface ConfigurationProps {
  selectedOS: OperatingSystem | undefined;
  selectedVersionId: string;
  onSelectVersion: (versionId: string) => void;
  selectedVersion: OSVersion | undefined;
  selectedFolderId: string;
  onSelectFolder: (folderId: string) => void;
  folderHue: number;
}

export function Configuration({
  selectedOS,
  selectedVersionId,
  onSelectVersion,
  selectedVersion,
  selectedFolderId,
  onSelectFolder,
  folderHue,
}: ConfigurationProps) {
  if (!selectedOS) return null;

  return (
    <NeumorphBox title="Configuration" subtitle="Choose your style">
      <div className="space-y-6">
        <div>
          <NeumorphDropdownList
            label="Version"
            placeholder="Select Version"
            value={selectedVersionId}
            onChange={onSelectVersion}
            items={selectedOS.versions.map((v) => ({
              label: v.name,
              value: v.id,
            }))}
            className="w-full"
          />
        </div>

        <div>
          <NeumorphToggleGroup
            title="Folder Style"
            variant="none"
            gridSize={2}
            className="gap-3"
            items={
              selectedVersion?.folderIcons.map((folder) => ({
                value: folder.id,
                label: '',
                imageSrc: folder.imageUrl,
                imageAlt: folder.name,
                imageStyle: {
                  filter: 'none',
                },
                imageSize: 'full',
              })) || []
            } // Handle undefined selectedVersion
            value={selectedFolderId}
            onChange={onSelectFolder}
          />
        </div>
      </div>
    </NeumorphBox>
  );
}
