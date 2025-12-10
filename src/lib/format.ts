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
export function formatDateTime(date: string | Date | undefined | null, fallback = '—'): string {
  if (!date) return fallback;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return fallback;

  return dateObj.toLocaleString(LOCALE);
}

/**
 * Formats a date as a relative time string (e.g., "5m ago", "2h ago").
 * Falls back to formatted date for times older than 7 days.
 */
export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diff = (new Date().getTime() - dateObj.getTime()) / 1000;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return dateObj.toLocaleDateString(LOCALE, DATE_FORMAT.LONG_ABBR);
}

/**
 * Formats bytes into human-readable file size.
 *
 * Examples:
 * - 0 → "0 B"
 * - 1024 → "1 KB"
 * - 1536 → "1.5 KB"
 * - 1048576 → "1 MB"
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Formats large numbers in a social media style with k/m/b suffixes.
 * Shows one decimal place for 1-2 digit numbers.
 *
 * Examples:
 * - 1200 → 1.2k
 * - 25763 → 25.7k
 * - 735894 → 735k
 * - 1837409 → 1.8m
 * - 17394023 → 17.3m
 * - 183649402 → 183m
 * - 2734749201 → 2.7b
 */
export function socialStyleLargeNumbers(num?: number): string {
  if (!num || num === 0) return '0';
  if (num < 1000) return num.toString();

  const formatWithPrecision = (value: number, suffix: string): string => {
    if (value < 10) {
      // 1 digit: show one decimal
      return (Math.floor(value * 10) / 10).toFixed(1) + suffix;
    } else if (value < 100) {
      // 2 digits: show one decimal
      return (Math.floor(value * 10) / 10).toFixed(1) + suffix;
    } else {
      // 3+ digits: no decimal
      return Math.floor(value) + suffix;
    }
  };

  if (num < 1_000_000) {
    return formatWithPrecision(num / 1000, 'k');
  }
  if (num < 1_000_000_000) {
    return formatWithPrecision(num / 1_000_000, 'm');
  }
  return formatWithPrecision(num / 1_000_000_000, 'b');
}

/**
 * Converts a string to kebab-case.
 * Example: "Choose a preset style" -> "choose-a-preset-style"
 */
export function toKebabCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

/**
 * Converts a string to Sentence case.
 * Example: "Choose a preset style" -> "Choose a preset style"
 */
export function toSentenceCase(str: string): string {
  const trimmed = str.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Converts a string to Capital Case (Start Case).
 * Example: "Choose a preset style" -> "Choose A Preset Style"
 */
export function toCapitalCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts a string to Title Case.
 * Capitalizes all words except minor words (articles, conjunctions, prepositions),
 * unless they are the first word.
 * Example: "Choose a preset style" -> "Choose a Preset Style"
 */
export function toTitleCase(str: string): string {
  const minorWords = new Set([
    'a',
    'an',
    'the',
    'and',
    'but',
    'or',
    'nor',
    'for',
    'yet',
    'so',
    'at',
    'by',
    'for',
    'in',
    'of',
    'on',
    'to',
    'up',
    'with',
    'from',
  ]);

  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !minorWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}
