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
    // Not authenticated, return an error response
    console.log('API /select-plan: User not authenticated');
    return NextResponse.json({ error: 'User not authenticated', redirectPath: '/signin' }, { status: 401 });
  }

  // User is authenticated, determine redirect and update role based on planKey
  try {
    const { planKey } = await req.json();
    let redirectPath: string | null = null;
    let targetRole: string | null = null;

    // Map planKey to role and redirect path
    if (planKey === 'family') {
      targetRole = 'parent';
      redirectPath = '/parent/dashboard';
    } else if (planKey === 'coop') {
      targetRole = 'teacher';
      redirectPath = '/teacher/dashboard';
    } else if (planKey === 'individual') {
      targetRole = 'student';
      redirectPath = '/chat';
    } else {
      // Handle invalid planKey
      console.error(`API /select-plan: Invalid planKey received: ${planKey}`);
      return NextResponse.json({ error: 'Invalid plan selected.' }, { status: 400 });
    }

    // Update the user's role in the database if a target role is defined
    if (targetRole) {
      console.log(`API /select-plan: Attempting to update role for user ${user.id} to ${targetRole}`);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: targetRole })
        .eq('id', user.id);

      if (updateError) {
        console.error('API /select-plan Error updating user role:', updateError);
        // Return an error so the user knows something went wrong.
        return NextResponse.json({ error: 'Failed to update user profile. Please try again.' }, { status: 500 });
      }
      console.log(`API /select-plan: Successfully updated role for user ${user.id} to ${targetRole}`);
    }

    console.log(`API /select-plan: User authenticated, determined redirect path: ${redirectPath}`);
    // Return the path in the JSON response
    return NextResponse.json({ redirectPath });

  } catch (error) {
    console.error('API /select-plan Error processing request:', error);
    // Return a generic error response
    return NextResponse.json({ error: 'Failed to process plan selection' }, { status: 500 });
  }
}
