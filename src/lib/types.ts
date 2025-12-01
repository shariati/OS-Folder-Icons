export interface FolderIcon {
  id: string;
  name: string;
  imageUrl: string;
  offsetX?: number;
  offsetY?: number;
}

export interface OSVersion {
  id: string;
  name: string;
  folderIcons: FolderIcon[];
}

export interface OperatingSystem {
  id: string;
  name: string;
  image?: string; // Icon for the OS itself
  brandIcon?: string; // FontAwesome icon class (e.g. "fa-brands fa-apple")
  format?: 'png' | 'ico' | 'icns'; // Default to png if undefined
  versions: OSVersion[];
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  tags: string[];
  previewImage?: string;
  targetOS: string[]; // List of OS IDs this bundle supports
  icons: {
    name: string; // Icon name
    type: 'lucide' | 'fontawesome';
  }[];
}

export interface DB {
  operatingSystems: OperatingSystem[];
  bundles: Bundle[];
}
