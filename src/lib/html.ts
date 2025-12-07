import { stripHtml } from './sanitize';

/**
 * Extract plain text from HTML content
 * @param html - HTML string
 * @param maxLength - Optional maximum length for the text
 * @returns Plain text extracted from HTML
 */
export function extractTextFromHtml(html: string, maxLength?: number): string {
    const text = stripHtml(html);

    if (maxLength && text.length > maxLength) {
        return text.substring(0, maxLength).trim() + '...';
    }

    return text;
}

/**
 * Calculate reading time from HTML content
 * Assumes average reading speed of 200 words per minute
 * @param html - HTML string
 * @returns Reading time in minutes
 */
export function calculateReadingTime(html: string): number {
    const text = stripHtml(html);
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200);

    return Math.max(1, readingTime); // Minimum 1 minute
}

/**
 * Truncate HTML content while preserving tags
 * @param html - HTML string
 * @param maxLength - Maximum character length
 * @returns Truncated HTML
 */
export function truncateHtml(html: string, maxLength: number): string {
    const text = stripHtml(html);

    if (text.length <= maxLength) {
        return html;
    }

    // Simple truncation - just cut at character limit
    // For production, consider using a library like 'truncate-html'
    const truncated = html.substring(0, maxLength);
    const lastTagStart = truncated.lastIndexOf('<');
    const lastTagEnd = truncated.lastIndexOf('>');

    // If we're in the middle of a tag, cut before it
    if (lastTagStart > lastTagEnd) {
        return truncated.substring(0, lastTagStart) + '...';
    }

    return truncated + '...';
}

/**
 * Generate an excerpt from HTML content
 * @param html - HTML string
 * @param maxLength - Maximum character length (default: 160)
 * @returns Plain text excerpt
 */
export function generateExcerpt(html: string, maxLength: number = 160): string {
    return extractTextFromHtml(html, maxLength);
}

/**
 * Count words in HTML content
 * @param html - HTML string
 * @returns Word count
 */
export function countWords(html: string): number {
    const text = stripHtml(html);
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Count characters in HTML content (excluding tags)
 * @param html - HTML string
 * @returns Character count
 */
export function countCharacters(html: string): number {
    const text = stripHtml(html);
    return text.length;
}
