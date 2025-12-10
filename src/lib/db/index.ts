import 'server-only';
import config from '../config';
import { DatabaseAdapter } from './types';
import { firestoreAdapter } from './firestore-adapter';

// Helper to get the correct adapter dynamically to avoid bundling fs on client
const getAdapter = async (): Promise<DatabaseAdapter> => {
  // Use Admin Adapter on server for secure access (bypassing rules)
  if (typeof window === 'undefined') {
    const { adminAdapter } = await import('./admin-adapter');
    return adminAdapter;
  }

  return firestoreAdapter;
};

export const getOperatingSystems = async () => (await getAdapter()).getOperatingSystems();
export const getOperatingSystem = async (id: string) => (await getAdapter()).getOperatingSystem(id);
export const saveOperatingSystem = async (os: any) => (await getAdapter()).saveOperatingSystem(os);
export const deleteOperatingSystem = async (id: string) =>
  (await getAdapter()).deleteOperatingSystem(id);
export const getBundles = async () => (await getAdapter()).getBundles();
export const getCategories = async () => (await getAdapter()).getCategories();
export const getTags = async () => (await getAdapter()).getTags();
export const getHeroSlides = async () => (await getAdapter()).getHeroSlides();

export const getUser = async (uid: string) => (await getAdapter()).getUser(uid);
export const createUser = async (user: any) => (await getAdapter()).createUser(user);
export const updateUser = async (uid: string, data: any) =>
  (await getAdapter()).updateUser(uid, data);
export const getUsers = async () => (await getAdapter()).getUsers();
export const deleteUser = async (uid: string) => (await getAdapter()).deleteUser(uid);

export const getBlogPosts = async () => (await getAdapter()).getBlogPosts();
export const saveBlogPost = async (post: any) => (await getAdapter()).saveBlogPost(post);
export const updateBlogPost = async (id: string, data: any) =>
  (await getAdapter()).updateBlogPost(id, data);
export const deleteBlogPost = async (id: string) => (await getAdapter()).deleteBlogPost(id);

export const getPages = async () => (await getAdapter()).getPages();
export const savePage = async (page: any) => (await getAdapter()).savePage(page);
export const deletePage = async (id: string) => (await getAdapter()).deletePage(id);

export const getSettings = async () => (await getAdapter()).getSettings();
export const saveSettings = async (settings: any) => (await getAdapter()).saveSettings(settings);

export const getLifetimeUserCount = async () => (await getAdapter()).getLifetimeUserCount();

export const getDB = async () => (await getAdapter()).getDB();
export const saveDB = async (data: any) => (await getAdapter()).saveDB(data);
