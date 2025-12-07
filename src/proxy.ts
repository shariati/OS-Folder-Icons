import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildCSPHeader } from '@/lib/security/csp-config';

/**
 * Add security headers to a response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
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

export function proxy(req: NextRequest) {
    const hostname = req.nextUrl.hostname;
    const isStaging = hostname === 'test.hdpick.com';

    if (isStaging) {
        // 1. SEO Blocking
        const response = NextResponse.next();
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');

        // 2. Basic Authentication
        const basicAuth = req.headers.get('authorization');
        const user = process.env.STAGING_USER;
        const pwd = process.env.STAGING_PASSWORD;

        if (!user || !pwd) {
            return new NextResponse('Staging authentication not configured', {
                status: 503,
                headers: {
                    'X-Robots-Tag': 'noindex, nofollow',
                },
            });
        }

        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            const [authUser, authPwd] = atob(authValue).split(':');

            if (authUser === user && authPwd === pwd) {
                return addSecurityHeaders(response);
            }
        }

        return new NextResponse('Authentication required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Staging Area"',
                'X-Robots-Tag': 'noindex, nofollow',
            },
        });
    }

    // Apply security headers to all responses
    const response = NextResponse.next();
    return addSecurityHeaders(response);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets (images, video, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webm|mp4)$).*)',
    ],
};

