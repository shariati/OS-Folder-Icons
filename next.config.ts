import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// =============================================================================
// CSP Domain Whitelists (inline to avoid module resolution issues in next.config)
// =============================================================================

// Trusted domains for embedding (iframes, video players, etc.)
const TRUSTED_EMBED_DOMAINS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
];

// Trusted domains for analytics and tracking
const TRUSTED_ANALYTICS_DOMAINS = [
  '*.google-analytics.com',
  'www.googletagmanager.com',
  '*.clarity.ms',
  'clarity.ms',
  '*.bing.com',
];

// Trusted domains for advertising
const TRUSTED_AD_DOMAINS = [
  'pagead2.googlesyndication.com',
  '*.googlesyndication.com',
  'adservice.google.com',
  '*.googleadservices.com',
  'googleads.g.doubleclick.net',
  '*.doubleclick.net',
  'tpc.googlesyndication.com',
  '*.google.com',
];

// Trusted domains for fonts
const TRUSTED_FONT_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

// Firebase domains (and Google Auth)
const TRUSTED_FIREBASE_DOMAINS = [
  '*.firebaseapp.com',
  '*.firebase.com',
  '*.firebaseio.com',
  '*.googleapis.com',
  '*.cloudfunctions.net',
  'firebasestorage.googleapis.com',
  'accounts.google.com',
  'apis.google.com',
];

// Stripe domains
const TRUSTED_STRIPE_DOMAINS = [
  'js.stripe.com',
  '*.stripe.com',
  'api.stripe.com',
  'checkout.stripe.com',
];

// Vercel domains (for preview deployments)
const TRUSTED_VERCEL_DOMAINS = [
  '*.vercel.live',
  'vercel.live',
  '*.vercel.app',
];

// Build CSP header inline
function buildCSPHeader(): string {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
      "'unsafe-inline'",
      ...TRUSTED_ANALYTICS_DOMAINS,
      ...TRUSTED_AD_DOMAINS,
      ...TRUSTED_STRIPE_DOMAINS,
      ...TRUSTED_VERCEL_DOMAINS,
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
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
    'font-src': [
      "'self'",
      'data:',
      ...TRUSTED_FONT_DOMAINS,
    ],
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
    'media-src': [
      "'self'",
      'blob:',
      ...TRUSTED_FIREBASE_DOMAINS,
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': [
      "'self'",
      'accounts.google.com',
      '*.firebaseapp.com',
    ],
    'frame-ancestors': ["'self'"],
    'upgrade-insecure-requests': [],
  };

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

// =============================================================================
// Next.js Configuration
// =============================================================================

const nextConfig: NextConfig = {
  // Compile packages that need optimization
  transpilePackages: ['lucide-react'],

  // Image optimization for retina and responsive images
  images: {
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images (including 2x retina: 1536, 2048, 3840)
    deviceSizes: [640, 750, 828, 1080, 1200, 1536, 1920, 2048, 3840],
    // Image sizes for fixed-width images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,
    // Remote patterns for Firebase Storage and Google
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },

  // Optimize icon library imports
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },

  // Cache headers for static assets
  async headers() {
    const cspHeader = buildCSPHeader();

    return [
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
      // Cache headers for images
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache headers for Next.js static files
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
