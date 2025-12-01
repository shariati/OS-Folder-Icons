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
    type: 'lucide' | 'fontawesome' | 'heroicons';
  }[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string; // PNG with transparent background
  color: string; // Background color for the card (e.g., "bg-red-500")
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  link?: string;
  order: number;
}

export interface DB {
  operatingSystems: OperatingSystem[];
  bundles: Bundle[];
  categories: Category[];
  tags: Tag[];
  heroSlides: HeroSlide[];
}
