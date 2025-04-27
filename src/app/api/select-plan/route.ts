import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  // Re-initialize response for potential cookie updates
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
          response = NextResponse.next({ // Recreate response object on cookie change
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request and response cookies.
          req.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ // Recreate response object on cookie change
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Check if user is authenticated server-side
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    // Not authenticated, redirect to signin
    const url = req.nextUrl.clone();
    url.pathname = '/signin';
    console.log('API /select-plan: User not authenticated, redirecting to /signin');
    // Return a NEW redirect response, not the potentially modified 'response' object
    return NextResponse.redirect(url);
  }

  // User is authenticated, determine redirect based on planKey
  try {
    const { planKey } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    let redirectPath = '/chat'; // Default for individual

    if (planKey === 'family' || planKey === 'coop') {
      redirectPath = '/teacher/dashboard';
    }

    const redirectUrl = new URL(redirectPath, baseUrl);
    console.log(`API /select-plan: User authenticated, redirecting to ${redirectUrl.toString()}`);
    // Return a NEW redirect response
    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('API /select-plan Error reading planKey or creating URL:', error);
    const url = req.nextUrl.clone();
    url.pathname = '/pricing'; // Redirect back to pricing on error
    url.searchParams.set('error', 'plan_selection_failed');
    // Return a NEW redirect response
    return NextResponse.redirect(url);
  }

  // Note: The initial 'response' object is not explicitly returned here,
  // as the function should always return one of the NextResponse.redirect calls.
}
