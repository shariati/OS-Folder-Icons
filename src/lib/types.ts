import { UserProfile } from '../types/user';
export type { UserProfile };

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
    type: 'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons';
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
  users: UserProfile[];
  auditLogs: AuditLog[];
  blogPosts: BlogPost[];
  pages: Page[];
  settings: Settings;
}

export interface AdConfig {
  enabled: boolean;
  provider: 'adsterra' | 'google-adsense' | 'propellerads';
  adsterra: {
    script: string;
  };
  googleAdsense: {
    client: string;
    slot: string;
  };
  propellerads: {
    zoneId: string;
    script: string;
  };
}

export interface Settings {
  gaMeasurementId?: string;
  adConfig?: AdConfig;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  userId: string;
  userEmail: string;
  timestamp: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  publishedAt?: string;
  authorId: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}
