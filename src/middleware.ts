import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildCSPHeader } from '@/lib/security/csp-config';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Generate CSP header
    const cspHeader = buildCSPHeader();

    // Security Headers
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Content Security Policy
    response.headers.set('Content-Security-Policy', cspHeader);

    // Additional security for production
    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    return response;
}

// Apply middleware to all routes except static files and images
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webm|mp4)$).*)',
    ],
};
