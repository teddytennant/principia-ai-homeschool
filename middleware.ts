import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Exclude certain paths from the site password check
const EXEMPT_PATHS = [
  '/password',
  '/api/password/unlock',
  '/_next',
  '/_static',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public files and exempt routes
  if (
    EXEMPT_PATHS.some(path => pathname.startsWith(path)) ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') // static file extensions
  ) {
    return NextResponse.next();
  }

  // Check site password cookie
  const sitePass = req.cookies.get('site_pass');
  if (sitePass !== 'TennantFam2467*/') {
    const url = req.nextUrl.clone();
    url.pathname = '/password';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
