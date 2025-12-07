/**
 * Check if a URL is external (not part of the current site)
 * @param url - URL to check
 * @returns True if URL is external
 */
export function isExternalUrl(url: string): boolean {
    if (!url) return false;

    // Check if it's a relative URL
    if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
        return false;
    }

    // Check if it's an absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // Check if it's the same domain
        if (typeof window !== 'undefined') {
            try {
                const urlObj = new URL(url);
                return urlObj.hostname !== window.location.hostname;
            } catch {
                return true;
            }
        }
        return true;
    }

    // mailto:, tel:, etc. are considered external
    if (url.includes(':')) {
        return true;
    }

    return false;
}

/**
 * Get the site URL from environment or default
 * @returns Site URL
 */
export function getSiteUrl(): string {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    // Server-side: use environment variable or default
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

/**
 * Generate full URL from slug
 * @param slug - Page or blog post slug
 * @param type - Type of content ('page' or 'blog')
 * @returns Full URL
 */
export function getFullUrl(slug: string, type: 'page' | 'blog' = 'page'): string {
    const siteUrl = getSiteUrl();

    if (type === 'blog') {
        return `${siteUrl}/blog/${slug}`;
    }

    return `${siteUrl}/${slug}`;
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                textArea.remove();
                return true;
            } catch (error) {
                textArea.remove();
                return false;
            }
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}
