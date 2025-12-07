export const SOCIAL_LINKS = {
    GITHUB: 'https://github.com/shariati/OS-Folder-Icons',
    LINKEDIN: 'https://www.linkedin.com/in/aminshariati',
    BEHANCE: 'https://www.behance.net/aminshariati?',
    MEDIUM: 'https://medium.com/@shariati',
};

export const PROJECT_LINKS = {
    GITHUB_DISCUSSIONS: 'https://github.com/shariati/OS-Folder-Icons/discussions/categories/q-a',
};

export const EXTERNAL_LINKS = {
    MICROSOFT_PRIVACY: 'https://privacy.microsoft.com/en-US/privacystatement',
    CLARITY_DISCLOSURE: 'https://learn.microsoft.com/en-us/clarity/setup-and-installation/privacy-disclosure',
};

export const SOCIAL_SHARE_URLS = {
    TWITTER: 'https://twitter.com/intent/tweet',
    FACEBOOK: 'https://www.facebook.com/sharer/sharer.php',
    LINKEDIN: 'https://www.linkedin.com/sharing/share-offsite/',
};

export const RESOURCE_LINKS = {
    FONTAWESOME: 'https://fontawesome.com',
    LUCIDE: 'https://lucide.dev',
};

// Firebase Storage CDN
export const FIREBASE_STORAGE = {
    BASE_URL: 'https://firebasestorage.googleapis.com/v0/b',
    VIDEO_BACKGROUND: 'public/home-video-background-1.webm',
};

/**
 * Constructs a Firebase Storage CDN URL for a given file path.
 * @param path - The path to the file in Firebase Storage (e.g., 'public/file.webm')
 * @returns The full Firebase Storage CDN URL
 */
export const getFirebaseStorageUrl = (path: string): string => {
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const encodedPath = encodeURIComponent(path);
    return `${FIREBASE_STORAGE.BASE_URL}/${bucket}/o/${encodedPath}?alt=media`;
};
