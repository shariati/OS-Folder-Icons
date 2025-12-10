import {
  DB,
  OperatingSystem,
  Bundle,
  Category,
  Tag,
  HeroSlide,
  BlogPost,
  Page,
  Settings,
} from '../types';
import { UserProfile } from '../../types/user';

export interface DatabaseSchema {
  operatingSystems: OperatingSystem[];
  bundles: Bundle[];
  categories: Category[];
  tags: Tag[];
  heroSlides: HeroSlide[];
  users?: UserProfile[];
  blogPosts?: BlogPost[];
  pages?: Page[];
  settings?: Settings;
}

export interface DatabaseAdapter {
  getOperatingSystems(): Promise<OperatingSystem[]>;
  getOperatingSystem(id: string): Promise<OperatingSystem | null>;
  saveOperatingSystem(os: OperatingSystem): Promise<void>;
  deleteOperatingSystem(id: string): Promise<void>;
  getBundles(): Promise<Bundle[]>;
  getCategories(): Promise<Category[]>;
  getTags(): Promise<Tag[]>;
  getHeroSlides(): Promise<HeroSlide[]>;
  getUser(uid: string): Promise<UserProfile | null>;
  createUser(user: UserProfile): Promise<void>;
  updateUser(uid: string, data: Partial<UserProfile>): Promise<void>;
  getUsers(): Promise<UserProfile[]>;
  deleteUser(uid: string): Promise<void>;
  getBlogPosts(): Promise<BlogPost[]>;
  saveBlogPost(post: BlogPost): Promise<void>;
  updateBlogPost(id: string, data: Partial<BlogPost>): Promise<void>;
  deleteBlogPost(id: string): Promise<void>;
  getPages(): Promise<Page[]>;
  savePage(page: Page): Promise<void>;
  deletePage(id: string): Promise<void>;
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
  getLifetimeUserCount(): Promise<number>;
  getDB(): Promise<DB>; // For backward compatibility
  saveDB(db: DB): Promise<void>; // For backward compatibility
}
