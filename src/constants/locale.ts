/**
 * Application Locale Settings
 * All dates should use en-GB locale for consistent UK English formatting
 */

export const LOCALE = 'en-GB';

/**
 * Date Format Options
 * - LONG: User-facing dates (e.g., "07 December 2024")
 * - LONG_ABBR: Admin dashboard dates (e.g., "07 Dec 2024")
 * - SHORT: Compact dates (e.g., "07/12/2024")
 */
export const DATE_FORMAT = {
    /** User-facing: dd MMMM yyyy - "07 December 2024" */
    LONG: {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    } as Intl.DateTimeFormatOptions,

    /** Admin dashboard: dd MMM yyyy - "07 Dec 2024" */
    LONG_ABBR: {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    } as Intl.DateTimeFormatOptions,

    /** Compact: dd/mm/yyyy - "07/12/2024" */
    SHORT: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    } as Intl.DateTimeFormatOptions,
};

/**
 * Format a date string or Date object using the specified format
 */
export function formatDate(
    date: string | Date | undefined | null,
    format: keyof typeof DATE_FORMAT = 'LONG',
    fallback = '—'
): string {
    if (!date) return fallback;

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return fallback;

    return dateObj.toLocaleDateString(LOCALE, DATE_FORMAT[format]);
}

/**
 * Format a date with full timestamp for detailed displays
 */
export function formatDateTime(
    date: string | Date | undefined | null,
    fallback = '—'
): string {
    if (!date) return fallback;

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return fallback;

    return dateObj.toLocaleString(LOCALE);
}
