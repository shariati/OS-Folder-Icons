/**
 * Content Security Policy and Domain Whitelist Configuration
 * Centralized list of trusted domains for CSP, iframes, and CORS
 */

// Trusted domains for embedding (iframes, video players, etc.)
export const TRUSTED_EMBED_DOMAINS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
] as const;

// Trusted domains for analytics and tracking
export const TRUSTED_ANALYTICS_DOMAINS = [
  '*.google-analytics.com',
  'www.googletagmanager.com',
  '*.clarity.ms',
  'clarity.ms',
  '*.bing.com',
] as const;

// Trusted domains for advertising
export const TRUSTED_AD_DOMAINS = [
  'pagead2.googlesyndication.com',
  '*.googlesyndication.com',
  'adservice.google.com',
  '*.googleadservices.com',
  'googleads.g.doubleclick.net',
  '*.doubleclick.net',
  'tpc.googlesyndication.com',
  '*.google.com',
] as const;

// Trusted domains for fonts
export const TRUSTED_FONT_DOMAINS = ['fonts.googleapis.com', 'fonts.gstatic.com'] as const;

// Firebase domains (and Google Auth)
export const TRUSTED_FIREBASE_DOMAINS = [
  '*.firebaseapp.com',
  '*.firebase.com',
  '*.firebaseio.com',
  '*.googleapis.com',
  '*.cloudfunctions.net',
  'firebasestorage.googleapis.com',
  'accounts.google.com',
  'apis.google.com',
] as const;

// Stripe domains
export const TRUSTED_STRIPE_DOMAINS = [
  'js.stripe.com',
  '*.stripe.com',
  'api.stripe.com',
  'checkout.stripe.com',
] as const;

// Vercel domains (for preview deployments)
export const TRUSTED_VERCEL_DOMAINS = ['*.vercel.live', 'vercel.live', '*.vercel.app'] as const;

// Build the CSP header value
export function buildCSPHeader(nonce?: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      // Allow eval in development for hot reload
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
      // Inline scripts (try to minimize, use nonce instead)
      "'unsafe-inline'", // Required for some Next.js functionality
      ...TRUSTED_ANALYTICS_DOMAINS,
      ...TRUSTED_AD_DOMAINS,
      ...TRUSTED_STRIPE_DOMAINS,
      ...TRUSTED_VERCEL_DOMAINS,
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-jsx and Tailwind
      ...TRUSTED_FONT_DOMAINS,
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      ...TRUSTED_FIREBASE_DOMAINS,
      ...TRUSTED_ANALYTICS_DOMAINS,
      ...TRUSTED_AD_DOMAINS,
      '*.googleusercontent.com',
      '*.gstatic.com',
      'i.ytimg.com',
      '*.youtube.com',
    ],
    'font-src': ["'self'", 'data:', ...TRUSTED_FONT_DOMAINS],
    'frame-src': [
      "'self'",
      ...TRUSTED_EMBED_DOMAINS,
      ...TRUSTED_AD_DOMAINS,
      ...TRUSTED_STRIPE_DOMAINS,
      ...TRUSTED_FIREBASE_DOMAINS,
    ],
    'connect-src': [
      "'self'",
      ...TRUSTED_FIREBASE_DOMAINS,
      ...TRUSTED_ANALYTICS_DOMAINS,
      ...TRUSTED_AD_DOMAINS,
      ...TRUSTED_STRIPE_DOMAINS,
      ...TRUSTED_VERCEL_DOMAINS,
      'wss://*.firebaseio.com',
      ...(isDevelopment ? ['ws://localhost:*', 'http://localhost:*'] : []),
    ],
    'media-src': ["'self'", 'blob:', ...TRUSTED_FIREBASE_DOMAINS],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'", 'accounts.google.com', '*.firebaseapp.com'],
    'frame-ancestors': ["'self'"],
    'upgrade-insecure-requests': [],
  };

  // Remove upgrade-insecure-requests in development
  if (isDevelopment) {
    delete directives['upgrade-insecure-requests'];
  }

  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

// Get list of allowed iframe source domains for HTML sanitization
export function getAllowedIframeDomains(): string[] {
  return [...TRUSTED_EMBED_DOMAINS];
}

// Check if a URL is from a trusted iframe source
export function isAllowedIframeSource(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return TRUSTED_EMBED_DOMAINS.some(
      (domain) => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}
