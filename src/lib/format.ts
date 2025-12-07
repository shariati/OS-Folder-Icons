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
