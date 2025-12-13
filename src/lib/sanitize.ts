import sanitizeHtmlLibrary from 'sanitize-html';

import { getAllowedIframeDomains, isAllowedIframeSource } from '@/lib/security/csp-config';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses sanitize-html with a strict whitelist
 */

const defaultOptions: sanitizeHtmlLibrary.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'span',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'pre',
    'code',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'blockquote',
    'iframe',
  ],
  allowedAttributes: {
    '*': ['class', 'id', 'style'],
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    iframe: [
      'src',
      'width',
      'height',
      'frameborder',
      'allow',
      'allowfullscreen',
      'scrolling',
      'title',
    ],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    iframe: ['https'], // Only allow HTTPS for iframes
  },
  // Transform iframes to only allow trusted sources
  transformTags: {
    iframe: (tagName, attribs) => {
      const src = attribs.src || '';

      // Only allow iframes from trusted domains
      if (!isAllowedIframeSource(src)) {
        // Strip the iframe entirely if not from trusted source
        return {
          tagName: 'p',
          attribs: {
            class: 'blocked-iframe-notice',
          },
          text: '[Embedded content from untrusted source removed]',
        };
      }

      // Keep the iframe but ensure it has security attributes
      return {
        tagName,
        attribs: {
          ...attribs,
          sandbox: 'allow-scripts allow-same-origin allow-presentation',
          loading: 'lazy',
        } as sanitizeHtmlLibrary.Attributes,
      };
    },
  },
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
      ...defaultOptions.transformTags,
      a: sanitizeHtmlLibrary.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
  });
}

/**
 * Strip all HTML tags from content
 */
export function stripHtml(html: string): string {
  return sanitizeHtmlLibrary(html, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

/**
 * Get list of allowed iframe domains for reference
 */
export { getAllowedIframeDomains };
