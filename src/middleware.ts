import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Adjust this if your auth cookie has a different name
const AUTH_COOKIE_NAME = 'token';
const SUPABASE_AUTH_COOKIE_PREFIX = 'sb-'; // Supabase auth cookies start with this prefix

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Create a Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => req.cookies.get(name)?.value } }
  );

  // Check if the user is authenticated and get their role from Supabase
  const getUserRole = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return null;
      }

      // Fetch user role from a profiles table or similar in Supabase
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .limit(1);

      if (profileError || !data || data.length === 0) {
        console.error('Error fetching user role from Supabase:', profileError?.message);
        return null;
      }

      return data[0].role;
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return null;
    }
  };

  // Check if user is authenticated and get role
  const role = await getUserRole();
  
  // Check for role cookie as a fallback if direct role check fails
  const roleCookie = req.cookies.get('role')?.value;
  const effectiveRole = role || roleCookie;

  // Always allow access to sign-in pages if not authenticated
  if (!effectiveRole && (pathname.startsWith('/signin') || pathname.startsWith('/teacher/signin'))) {
    return NextResponse.next();
  }

  // Allow access to the homepage, pricing, and Next.js assets
  // Exclude static files (e.g., favicon.ico, .png, .jpg, .svg, .css, .js)
  const staticFilePattern = /\.(ico|png|jpg|jpeg|svg|css|js|webmanifest|txt|woff2?|ttf|eot)$/i;
  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/pricing') ||
    staticFilePattern.test(pathname)
  ) {
    return NextResponse.next();
  }
  
  // Restrict access to API routes and chat to authenticated users only
  if (pathname.startsWith('/api') || pathname.startsWith('/chat')) {
    if (!effectiveRole) {
      const url = req.nextUrl.clone();
      url.pathname = '/signin/student';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (effectiveRole) {
    // Role-based dashboard access
    if (pathname.startsWith('/teacher/dashboard')) {
      if (effectiveRole === 'teacher') {
        return NextResponse.next();
      } else {
        // Student or unknown role trying to access teacher dashboard
        const url = req.nextUrl.clone();
        url.pathname = '/chat';
        return NextResponse.redirect(url);
      }
    }
    if (pathname.startsWith('/chat')) {
      if (effectiveRole === 'student') {
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
      if (effectiveRole === 'teacher') {
        url.pathname = '/teacher/dashboard';
      } else if (effectiveRole === 'student') {
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
