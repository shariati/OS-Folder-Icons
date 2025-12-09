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
  // Default template for this version
  defaultFolderUrl?: string;
  defaultOffsetX?: number;
  defaultOffsetY?: number;
}

export interface OperatingSystem {
  id: string;
  name: string;
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

// Favicon configuration for all device sizes and formats
export interface FaviconConfig {
  // Standard browser favicons
  favicon16?: string;   // 16x16 - browser tabs
  favicon32?: string;   // 32x32 - new tab page, Windows desktop
  favicon48?: string;   // 48x48 - Windows taskbar
  faviconIco?: string;  // Multi-size .ico file

  // App icons
  appleTouch180?: string;  // 180x180 - Apple touch icon
  android192?: string;     // 192x192 - Android Chrome
  android512?: string;     // 512x512 - PWA splash

  // Animated favicon (GIF/APNG/WebP)
  animatedFavicon?: string;
  useAnimated?: boolean;

  // App background styling
  appBackgroundShape?: 'circle' | 'rounded' | 'square';
  appBackgroundColor?: string;
}

// Third-party tracking code configuration
export interface TrackingConfig {
  clarityCode?: string;
  googleAnalyticsCode?: string;
  googleAdsenseCode?: string;
}

// Default SEO settings for pages without custom SEO
export interface DefaultSeoConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

// Site identity (branding)
export interface SiteIdentity {
  siteName?: string;
  headline?: string;
  tagline?: string;
  logo?: string;
  darkLogo?: string;  // For dark mode
}

export interface Settings {
  adConfig?: AdConfig;
  favicon?: FaviconConfig;
  tracking?: TrackingConfig;
  defaultSeo?: DefaultSeoConfig;
  defaultSocial?: SocialMetadata;
  siteIdentity?: SiteIdentity;
}

// Social Metadata for Open Graph and Twitter Cards
export interface SocialMetadata {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'blog';
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}



export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML content from Tiptap editor
  excerpt?: string;
  coverImage?: string;

  // Status & Scheduling
  status: 'draft' | 'published' | 'scheduled';
  published: boolean; // Kept for backward compatibility, sync with status
  publishedAt?: string;
  scheduledAt?: string;

  createdAt?: string;
  updatedAt?: string;
  authorId: string;

  // Analytics
  views?: number;
  readingTime?: number; // In minutes

  // Taxonomy
  tags?: string[];

  // SEO & Social
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[]; // Kept for backward compatibility
  focusKeyword?: string;
  socialImage?: string;
  social?: SocialMetadata;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML content from editor
  coverImage?: string;
  status: 'draft' | 'published';
  authorId?: string;
  views?: number;
  components?: string[]; // Track which components are used
  createdAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  social?: SocialMetadata;
}
