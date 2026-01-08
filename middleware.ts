import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl;
    const path = url.pathname;

    // Skip internal paths and API routes
    if (path.startsWith('/_next') ||
        path.startsWith('/api') ||
        path.startsWith('/static') ||
        path.includes('.')) {
        return NextResponse.next();
    }

    // Define main domains
    const isLocalhost = hostname.includes('localhost');
    const isMainDomain = hostname === 'kuiz.digital' || hostname === 'www.kuiz.digital' || hostname === 'quizk.com' || isLocalhost;

    // Check for auth token on dashboard routes
    if (path.startsWith('/dashboard')) {
        const token = request.cookies.get('auth_token');
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    // 1. Subdomains (e.g. desafiolowticket.kuiz.digital)
    // We want to rewrite sub.kuiz.digital -> /f/sub
    if (hostname.endsWith('.kuiz.digital') && !isMainDomain) {
        const subdomain = hostname.replace('.kuiz.digital', '');
        // Avoid rewriting if it's www
        if (subdomain !== 'www') {
            return NextResponse.rewrite(new URL(`/f/${subdomain}${path === '/' ? '' : path}`, request.url));
        }
    }

    // 2. Custom Domains (CNAME)
    // If it's not a main domain and not a handled subdomain, treat as custom domain
    if (!isMainDomain && !hostname.endsWith('.kuiz.digital') && !hostname.endsWith('.vercel.app')) {
        return NextResponse.rewrite(new URL(`/f/cname/${hostname}${path}`, request.url));
    }

    // 3. Clean Links on Main Domain (e.g. kuiz.digital/slug -> /f/slug)
    // Only if it's not a reserved path
    const reservedPaths = ['/login', '/register', '/dashboard', '/f', '/api', '/admin'];
    const isReserved = reservedPaths.some(p => path.startsWith(p));

    if (isMainDomain && !isReserved && path !== '/') {
        // Rewrite /slug to /f/slug
        return NextResponse.rewrite(new URL(`/f${path}`, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
