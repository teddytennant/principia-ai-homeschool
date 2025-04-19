import { NextRequest, NextResponse } from 'next/server';

// Adjust this if your auth cookie has a different name
const AUTH_COOKIE_NAME = 'token';
const SUPABASE_AUTH_COOKIE_PREFIX = 'sb-'; // Supabase auth cookies start with this prefix

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for site-wide password before anything else
  const sitePassword = req.cookies.get('site-password')?.value;
  if (sitePassword !== 'correct' && pathname !== '/password-gate') {
    // Redirect to password gate page if password is not set or incorrect, and not already on password-gate
    const url = req.nextUrl.clone();
    url.pathname = '/password-gate';
    return NextResponse.redirect(url);
  }

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
    pathname.startsWith('/password-gate') || // allow access to password gate page
    staticFilePattern.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check for authentication cookie (either custom token or Supabase auth cookie)
  // Use sb-access-token cookie for authentication check
  const accessToken = req.cookies.get('sb-access-token')?.value;
  // Read role cookie
  const role = req.cookies.get('role')?.value;
  
  if (!accessToken) {
    // Redirect unauthenticated users to the appropriate sign-in page
    const url = req.nextUrl.clone();
    if (pathname.startsWith('/teacher/dashboard')) {
      url.pathname = '/signin/teacher';
    } else if (pathname.startsWith('/chat')) {
      url.pathname = '/signin';
    } else {
      url.pathname = '/';
    }
    return NextResponse.redirect(url);
  } else if (accessToken) {
    // Role-based dashboard access
    if (pathname.startsWith('/teacher/dashboard')) {
      if (role === 'teacher') {
        return NextResponse.next();
      } else {
        // Student or unknown role trying to access teacher dashboard
        const url = req.nextUrl.clone();
        url.pathname = '/chat';
        return NextResponse.redirect(url);
      }
    }
    if (pathname.startsWith('/chat')) {
      if (role === 'student') {
        return NextResponse.next();
      } else {
        // Teacher or unknown role trying to access student chat
        const url = req.nextUrl.clone();
        url.pathname = '/teacher/dashboard';
        return NextResponse.redirect(url);
      }
    }
    // Prevent redirecting authenticated users to homepage if coming from sign-in
    if (pathname === '/' || pathname.startsWith('/signin')) {
      const url = req.nextUrl.clone();
      if (role === 'teacher') {
        url.pathname = '/teacher/dashboard';
      } else if (role === 'student') {
        url.pathname = '/chat';
      } else {
        url.pathname = '/';
      }
      return NextResponse.redirect(url);
    }
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
