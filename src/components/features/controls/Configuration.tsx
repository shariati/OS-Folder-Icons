import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeumorphDropdownList } from '@/components/ui/NeumorphDropdownList';
import { OperatingSystem, OSVersion, FolderIcon } from '@/lib/types';
import { clsx } from 'clsx';
import Image from 'next/image';

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
          <div className="mb-3 flex items-center gap-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Folder Style
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {selectedVersion?.folderIcons.map((folder) => (
              <NeumorphBox
                as="button"
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                variant={selectedFolderId === folder.id ? 'pressed' : 'flat'}
                className={clsx(
                  'relative aspect-square overflow-hidden rounded-xl p-2 transition-all duration-200',
                  selectedFolderId === folder.id
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent'
                    : 'hover:-translate-y-1'
                )}
              >
                <Image
                  src={folder.imageUrl}
                  alt={folder.name}
                  fill
                  sizes="(max-width: 768px) 33vw, 15vw"
                  className="object-contain p-2"
                  style={{
                    filter:
                      folderHue !== 0
                        ? `hue-rotate(${folderHue}deg) sepia(0.5) saturate(2)`
                        : 'none',
                  }}
                />
              </NeumorphBox>
            ))}
          </div>
        </div>
      </div>
    </NeumorphBox>
  );
}
