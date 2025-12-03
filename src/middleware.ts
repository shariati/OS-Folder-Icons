import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
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
                return response;
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

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};
