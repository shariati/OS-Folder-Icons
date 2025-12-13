import config from '../config';
import { firebaseStorageAdapter } from './firebase-adapter';
import { StorageAdapter } from './types';

// Helper to get the correct adapter dynamically
const getAdapter = async (): Promise<StorageAdapter> => {
  if (config.isLocal) {
    // Ensure we are on server before importing local-adapter (fs module)
    if (typeof window === 'undefined') {
      const { localStorageAdapter } = await import('./local-adapter');
      return localStorageAdapter;
    } else {
      // If on client side in local mode, we might need a different strategy
      // or just rely on API routes which run on server.
      // For direct client-side uploads in local mode, it's tricky without an API.
      // But usually uploads go through API route /api/upload.
      // So this code will likely run on server.
      console.warn('Local Storage Adapter (fs) cannot be used in browser.');
      return firebaseStorageAdapter; // Fallback or throw
    }
  }
  return firebaseStorageAdapter;
};

export const uploadFile = async (file: File | Buffer, filename: string, folder?: string) =>
  (await getAdapter()).uploadFile(file, filename, folder);
export const deleteFile = async (url: string) => (await getAdapter()).deleteFile(url);
