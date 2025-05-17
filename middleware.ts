import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
// import type { Database } from '@/types/supabase'; // Removed due to missing types - generate later

// --- START: Paywall Toggle ---
// Set this to true to enable subscription checks, false to disable them globally.
export const ENABLE_PAYWALL_CHECK = true; // Enabled paywall check
// --- END: Paywall Toggle ---

// Exclude certain paths from ALL checks (auth)
const ALWAYS_EXEMPT_PATHS = [
  // '/password', // Site password entry page - REMOVED
  // '/api/password/unlock', // Site password API - REMOVED
  '/api/auth', // Supabase auth callbacks (e.g., for OAuth, magic links)
  '/api/webhooks', // Allow webhooks (Stripe) - Re-added
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
  '/help', // Added help page
  '/forgot-password', // Allow access to forgot password page
  '/reset-password', // Allow access to reset password page
  '/payment/success', // Allow access to payment success page for post-payment processing
  // Add other public informational pages here
];

// Routes that require authentication but maybe not subscription (adjust as needed)
const AUTHENTICATED_ROUTES = [
    '/settings', // General user settings
];

// Routes specifically for teachers
const TEACHER_ROUTES = [
    '/teacher/dashboard',
    '/teacher/settings',
    '/teacher/students', // Assuming student management is teacher-only
    // Add other teacher-specific routes
];

// Routes specifically for students
const STUDENT_ROUTES = [
    '/chat', // Assuming chat is student-only
     // Add other student-specific routes
];

// Routes specifically for parents
const PARENT_ROUTES = [
    '/parent/dashboard',
    '/parent/settings', // Assuming settings exist
    '/parent/students', // Assuming student management exists for parents
    // Add other parent-specific routes
];

// Routes that require an active subscription (can overlap with others)
const SUBSCRIPTION_ROUTES = [
  '/chat',
  '/teacher/dashboard',
  '/teacher/settings',
  '/teacher/students',
  '/parent/dashboard', // Add parent routes that require subscription
  '/parent/settings',
  '/parent/students',
  // Add other routes that require payment
];

// Site password REMOVED
// const SITE_PASSWORD = `TennantFam2467*/`; // Consider moving to env var

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Check for always exempt paths (skip all checks)
  if (
    ALWAYS_EXEMPT_PATHS.some(path => pathname.startsWith(path)) ||
    pathname.includes('.') // Assume paths with extensions are static files
  ) {
    return NextResponse.next();
  }

  // 2. Check site password cookie - REMOVED
  // const sitePass = req.cookies.get('site_pass')?.value;
  // if (sitePass !== SITE_PASSWORD) {
  //   const url = req.nextUrl.clone();
  //   url.pathname = '/password'; // Redirect to site password entry
  //   // Prevent redirect loop for the password page itself
  //   if (pathname !== '/password') {
  //     return NextResponse.redirect(url);
  //   }
  // }

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
          // If the cookie is set, update the request and response cookies.
          req.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request and response cookies.
          req.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Explicitly try to refresh the session first - might help with timing issues
  await supabase.auth.refreshSession();
  // Now use getUser() to validate the session based on cookies
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || (route !== '/' && pathname.startsWith(route + '/')) // Check prefix for sub-routes
  );
  const isAuthRoute = pathname.startsWith('/signin') || pathname.startsWith('/signup');

  // 3. Handle Authentication Logic
  if (userError || !user) { // Check for error or no user
    // User is not logged in or session is invalid
    if (!isPublicRoute) {
      // Check if coming from payment success with a specific query parameter
      const fromPayment = req.nextUrl.searchParams.get('fromPayment') === 'true';
      if (fromPayment && pathname.startsWith('/parent/dashboard')) {
        console.log(`Bypassing auth redirect for user from payment success to ${pathname}`);
        return response; // Allow access temporarily
      }
      // Redirect to signin if trying to access a protected route
      const url = req.nextUrl.clone();
      url.pathname = '/signin';
      console.log(`Redirecting unauthenticated user from ${pathname} to /signin`);
      return NextResponse.redirect(url);
    }
    // Allow access to public routes if not logged in
  } else {
    // User is logged in

    // Explicitly refresh session again right before profile check to mitigate potential timing issues
    await supabase.auth.refreshSession();

    // Fetch user role (needed for role-based access and potentially redirection)
    let userRole: string | null = null;
    console.log(`Middleware: Fetching profile for user ${user.id} after second refresh.`); // Add log
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, stripe_subscription_status') // Use correct column name
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('Middleware: Error fetching profile for role/sub check:', profileError.message);
        // If profile fetch fails, maybe redirect to an error page or sign out?
        // For now, sign out to prevent inconsistent state.
        await supabase.auth.signOut();
        const url = req.nextUrl.clone();
        url.pathname = '/signin'; // Redirect to signin after signout
        return NextResponse.redirect(url);
    }
    userRole = profile?.role || null;
    const subscriptionStatus = profile?.stripe_subscription_status || null; // Use correct column name

    // Redirect logged-in users away from signin/signup pages
    if (isAuthRoute) {
      const url = req.nextUrl.clone();
      // Redirect to appropriate dashboard based on role
      url.pathname = userRole === 'teacher' ? '/teacher/dashboard' : '/chat'; // Default to chat for students/others
      console.log(`Redirecting authenticated ${userRole || 'user'} from ${pathname} to ${url.pathname}`);
      return NextResponse.redirect(url);
    }

    // --- Role-Based Access Control ---
    const isTeacherRoute = TEACHER_ROUTES.some(route => pathname.startsWith(route));
    const isStudentRoute = STUDENT_ROUTES.some(route => pathname.startsWith(route));
    const isParentRoute = PARENT_ROUTES.some(route => pathname.startsWith(route)); // Check for parent routes

    if (isTeacherRoute && userRole !== 'teacher') {
        console.log(`Redirecting non-teacher user (${userRole}) from teacher route ${pathname}`);
        const url = req.nextUrl.clone();
        // Redirect based on actual role if possible, otherwise default
        url.pathname = userRole === 'parent' ? '/parent/dashboard' : userRole === 'student' ? '/chat' : '/';
        return NextResponse.redirect(url);
    }

    if (isStudentRoute && userRole !== 'student') {
         console.log(`Redirecting non-student user (${userRole}) from student route ${pathname}`);
         const url = req.nextUrl.clone();
         // Redirect based on actual role if possible, otherwise default
         url.pathname = userRole === 'parent' ? '/parent/dashboard' : userRole === 'teacher' ? '/teacher/dashboard' : '/';
         return NextResponse.redirect(url);
    }

    // Add check for parent routes
    if (isParentRoute && userRole !== 'parent') {
         console.log(`Redirecting non-parent user (${userRole}) from parent route ${pathname}`);
         const url = req.nextUrl.clone();
         // Redirect based on actual role if possible, otherwise default
         url.pathname = userRole === 'teacher' ? '/teacher/dashboard' : userRole === 'student' ? '/chat' : '/';
         return NextResponse.redirect(url);
    }

    // --- Subscription Check for Subscription-Required Routes ---
    const needsSubscription = SUBSCRIPTION_ROUTES.some(route => pathname.startsWith(route));

    if (needsSubscription) {
      // --- Add check for test user email ---
      const userEmail = user.email;
      const TEST_EMAIL_DOMAIN = '@test.principia.ai'; // Define your test domain

      if (userEmail && userEmail.endsWith(TEST_EMAIL_DOMAIN)) {
        console.log(`Allowing test user ${userEmail} access to protected route ${pathname}`);
        return response; // Skip subscription check for test users
      }
      // --- End check for test user email ---

      // Only run subscription check if the paywall is enabled
      if (ENABLE_PAYWALL_CHECK) {
        // Use the subscriptionStatus fetched earlier
        const isActive = subscriptionStatus === 'active';

        if (!isActive) {
          // User is logged in but doesn't have an active subscription
          console.log(`Redirecting user ${user.id} from subscription route ${pathname} to /pricing (status: ${subscriptionStatus})`);
          const url = req.nextUrl.clone();
          url.pathname = '/pricing'; // Redirect to pricing page
          return NextResponse.redirect(url);
        }
        // Allow access if subscription is active
      } // End of ENABLE_PAYWALL_CHECK block
    }
    // Allow access if route doesn't require subscription or paywall is disabled
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
