import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '../firebase/client';
import { StorageAdapter } from './types';

export const firebaseStorageAdapter: StorageAdapter = {
  async uploadFile(
    file: File | Buffer,
    filename: string,
    folder: string = 'uploads'
  ): Promise<string> {
    if (!storage) throw new Error('Firebase Storage not initialized');

    const storageRef = ref(storage, `${folder}/${filename}`);

    let uploadResult;
    if (Buffer.isBuffer(file)) {
      uploadResult = await uploadBytes(storageRef, file);
    } else {
      uploadResult = await uploadBytes(storageRef, file);
    }

    return await getDownloadURL(uploadResult.ref);
  },

  async deleteFile(url: string): Promise<void> {
    if (!storage) throw new Error('Firebase Storage not initialized');

    // Create a reference to the file to delete
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  },
};
