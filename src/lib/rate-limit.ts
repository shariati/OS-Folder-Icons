import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const logger = createLogger('rate-limit');

/**
 * Simple in-memory rate limiter
 * For production, consider using @upstash/ratelimit with Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

// Default limits for different endpoint types
export const RATE_LIMITS = {
  /** Auth endpoints - login, signup, password reset */
  auth: { maxRequests: 10, windowSeconds: 60 },
  /** Magic link / passwordless auth */
  magicLink: { maxRequests: 5, windowSeconds: 60 },
  /** Upload endpoints */
  upload: { maxRequests: 30, windowSeconds: 60 },
  /** Admin endpoints */
  admin: { maxRequests: 100, windowSeconds: 60 },
  /** General API */
  api: { maxRequests: 60, windowSeconds: 60 },
  /** Stripe webhook - should be generous as Stripe may retry */
  webhook: { maxRequests: 200, windowSeconds: 60 },
} as const;

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from various headers (Cloudflare, Vercel, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0].trim() || 'unknown';
  return ip;
}

/**
 * Check if request is rate limited
 * @returns null if allowed, or a NextResponse if rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  endpointType: keyof typeof RATE_LIMITS | RateLimitOptions
): NextResponse | null {
  const options = typeof endpointType === 'string' ? RATE_LIMITS[endpointType] : endpointType;

  const clientId = getClientId(request);
  const key = `${clientId}:${request.nextUrl.pathname}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + options.windowSeconds * 1000,
    };
    rateLimitStore.set(key, entry);
    return null;
  }

  // Increment count
  entry.count++;

  if (entry.count > options.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    logger.warn(
      { clientId, path: request.nextUrl.pathname, count: entry.count },
      'Rate limit exceeded'
    );

    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(options.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
        },
      }
    );
  }

  return null;
}

/**
 * Rate limit middleware wrapper for API routes
 */
export function withRateLimit<
  T extends (...args: [NextRequest, ...any[]]) => Promise<NextResponse>,
>(handler: T, endpointType: keyof typeof RATE_LIMITS = 'api'): T {
  return (async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const rateLimitResponse = checkRateLimit(request, endpointType);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(request, ...args);
  }) as T;
}
