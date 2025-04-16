import { NextRequest, NextResponse } from 'next/server';

// Adjust this if your auth cookie has a different name
const AUTH_COOKIE_NAME = 'token';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow access to the homepage, pricing, teacher sign in, student sign in, and Next.js assets
  // Exclude static files (e.g., favicon.ico, .png, .jpg, .svg, .css, .js)
  const staticFilePattern = /\.(ico|png|jpg|jpeg|svg|css|js|webmanifest|txt|woff2?|ttf|eot)$/i;
  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/teacher/signin') ||
    pathname.startsWith('/signin') || // student sign in
    pathname.startsWith('/chat') || // allow chat for students
    staticFilePattern.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check for authentication cookie
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    // Redirect unauthenticated users to the homepage
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure matcher to apply to all routes except those explicitly allowed
export const config = {
  matcher: [
    // Match all routes except static files and allowed public routes
    '/((?!_next/|api/|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|svg|css|js|webmanifest|txt|woff2?|ttf|eot)$|pricing|teacher/signin|signin).*)',
  ],
};
