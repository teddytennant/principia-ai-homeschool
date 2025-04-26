import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Exclude certain paths from ALL checks (site password and auth)
const ALWAYS_EXEMPT_PATHS = [
  '/password', // Site password entry page
  '/api/password/unlock', // Site password API
  '/api/auth', // Supabase auth callbacks
  '/_next', // Next.js internals
  '/_static', // Next.js internals
  '/favicon.ico',
  '/favicon.png', // Added favicon.png
  '/vercel.svg', // Added vercel.svg
  '/robots.txt',
  '/sitemap.xml',
  // Add any other static assets or public API routes here
];

// Routes accessible to everyone, logged in or not
// (Auth check might redirect logged-in users away from signin/signup)
const PUBLIC_ROUTES = [
  '/', // Home page
  '/signin',
  '/signin/student',
  '/signin/teacher',
  '/signup',
  '/pricing',
  '/how-it-works',
  '/privacy-policy',
  '/terms-of-service',
  // Add other public informational pages here
];

// Site password (keep this check)
const SITE_PASSWORD = `TennantFam2467*/`;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Check for always exempt paths (skip all checks)
  if (
    ALWAYS_EXEMPT_PATHS.some(path => pathname.startsWith(path)) ||
    pathname.includes('.') // Assume paths with extensions are static files
  ) {
    return NextResponse.next();
  }

  // 2. Check site password cookie
  const sitePass = req.cookies.get('site_pass')?.value;
  if (sitePass !== SITE_PASSWORD) {
    const url = req.nextUrl.clone();
    url.pathname = '/password'; // Redirect to site password entry
    // Prevent redirect loop for the password page itself
    if (pathname !== '/password') {
      return NextResponse.redirect(url);
    }
  }

  // --- Supabase Auth Check ---
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          response = NextResponse.next({ // Use NextResponse.next to handle potential cookie setting
            request: { headers: req.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ // Use NextResponse.next here too
            request: { headers: req.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh session if expired - important!
  const { data: { session } } = await supabase.auth.getSession();

  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || (route !== '/' && pathname.startsWith(route + '/'))
  );
  const isAuthRoute = pathname.startsWith('/signin') || pathname.startsWith('/signup');

  // 3. Handle Authentication Logic
  if (!session) {
    // User is not logged in
    if (!isPublicRoute) {
      // Redirect to signin if trying to access a protected route
      const url = req.nextUrl.clone();
      url.pathname = '/signin';
      console.log(`Redirecting unauthenticated user from ${pathname} to /signin`);
      return NextResponse.redirect(url);
    }
    // Allow access to public routes if not logged in
  } else {
    // User is logged in
    if (isAuthRoute) {
      // Redirect logged-in users away from signin/signup pages
      const url = req.nextUrl.clone();
      url.pathname = '/'; // Redirect to home page (or a dashboard)
      console.log(`Redirecting authenticated user from ${pathname} to /`);
      return NextResponse.redirect(url);
    }
    // Allow access to other routes (public or protected) if logged in
  }

  // If all checks pass, proceed
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - Handled separately or exempt
     * - _next/static (static files) - Exempt
     * - _next/image (image optimization files) - Exempt
     * - favicon.ico (favicon file) - Exempt
     * - images/ (public images) - Assuming you have this folder
     *
     * Adjust the matcher based on your specific needs.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|favicon.png|vercel.svg|images/).*)',
  ],
};
