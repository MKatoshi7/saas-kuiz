import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl;

    // Skip internal paths and API routes
    if (url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/api') ||
        url.pathname.startsWith('/static') ||
        url.pathname.includes('.')) {
        return NextResponse.next();
    }

    // Define allowed main domains
    // Adjust these based on your actual deployment domains
    const isMainDomain = hostname.includes('localhost') ||
        hostname.includes('quizk.com') ||
        hostname.endsWith('.vercel.app');

    // Check for auth token on dashboard routes
    if (url.pathname.startsWith('/dashboard')) {
        const token = request.cookies.get('auth_token');
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (!isMainDomain) {
        // It's a custom domain!
        // Rewrite to /f/cname/[domain]/[path]
        // Example: custom.com/some-path -> /f/cname/custom.com/some-path
        const path = url.pathname === '/' ? '' : url.pathname;
        return NextResponse.rewrite(new URL(`/f/cname/${hostname}${path}`, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
