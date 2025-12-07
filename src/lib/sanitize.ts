import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify with a strict whitelist of allowed tags and attributes
 */

// Configure allowed tags and attributes
const ALLOWED_TAGS = [
    // Text formatting
    'p', 'br', 'strong', 'em', 'u', 's', 'span', 'div',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Lists
    'ul', 'ol', 'li',
    // Links and media
    'a', 'img',
    // Code
    'pre', 'code',
    // Tables
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    // Quotes
    'blockquote',
];

const ALLOWED_ATTR = [
    'href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height',
    'class', 'id', 'style', // Limited style support
];

/**
 * Sanitize HTML content
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(html: string): string {
    if (typeof window === 'undefined') {
        // Server-side: Basic sanitization using regex
        // Remove script tags and their content
        let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove event handlers (onclick, onload, etc.)
        sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
        sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

        // Remove javascript: protocol
        sanitized = sanitized.replace(/javascript:/gi, '');



        // Remove object and embed tags
        sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');

        return sanitized;
    }

    // Client-side
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [...ALLOWED_TAGS, 'iframe'],
        ALLOWED_ATTR: [...ALLOWED_ATTR, 'frameborder', 'allow', 'allowfullscreen', 'scrolling'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
    });
}

/**
 * Sanitize HTML and ensure external links open in new tab
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML with proper link targets
 */
export function sanitizeHtmlWithLinks(html: string): string {
    const sanitized = sanitizeHtml(html);

    // Add target="_blank" and rel="noopener noreferrer" to external links
    if (typeof window !== 'undefined') {
        const div = document.createElement('div');
        div.innerHTML = sanitized;

        const links = div.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                // External link
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });

        return div.innerHTML;
    }

    return sanitized;
}

/**
 * Strip all HTML tags from content
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
    if (typeof window === 'undefined') {
        // Server-side: simple regex-based stripping
        return html.replace(/<[^>]*>/g, '').trim();
    }

    // Client-side: use DOM
    const div = document.createElement('div');
    div.innerHTML = sanitizeHtml(html);
    return div.textContent || div.innerText || '';
}
