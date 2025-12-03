export interface StorageAdapter {
    uploadFile(file: File | Buffer, filename: string, folder?: string): Promise<string>;
    deleteFile(url: string): Promise<void>;
}
