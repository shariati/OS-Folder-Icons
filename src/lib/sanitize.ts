import sanitizeHtmlLibrary from 'sanitize-html';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses sanitize-html with a strict whitelist
 */

const defaultOptions: sanitizeHtmlLibrary.IOptions = {
    allowedTags: [
        'p', 'br', 'strong', 'em', 'u', 's', 'span', 'div',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'a', 'img',
        'pre', 'code',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'blockquote',
        'iframe'
    ],
    allowedAttributes: {
        '*': ['class', 'id', 'style'],
        'a': ['href', 'target', 'rel', 'title'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'iframe': ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'scrolling'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
        iframe: ['http', 'https']
    }
};

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
    return sanitizeHtmlLibrary(html, defaultOptions);
}

/**
 * Sanitize HTML and ensure external links open in new tab
 */
export function sanitizeHtmlWithLinks(html: string): string {
    return sanitizeHtmlLibrary(html, {
        ...defaultOptions,
        transformTags: {
            'a': sanitizeHtmlLibrary.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' })
        }
    });
}

/**
 * Strip all HTML tags from content
 */
export function stripHtml(html: string): string {
    return sanitizeHtmlLibrary(html, {
        allowedTags: [],
        allowedAttributes: {}
    });
}
