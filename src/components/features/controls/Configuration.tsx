import { NeumorphBox } from '@/components/ui/NeumorphBox';
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
          <label className="mb-2 ml-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
            Version
          </label>
          <div className="relative">
            <NeumorphBox
              as="select"
              variant="pressed"
              value={selectedVersionId}
              onChange={(e: any) => onSelectVersion(e.target.value)}
              className="w-full appearance-none rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
            >
              {selectedOS.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </NeumorphBox>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
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
