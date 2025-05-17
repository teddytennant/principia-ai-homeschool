import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- Environment Variables ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // For getUser
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // For bypassing RLS
// --- End Environment Variables ---

// --- Initialization ---
let supabase: ReturnType<typeof createClient> | null = null; // Client for auth verification
let supabaseAdmin: ReturnType<typeof createClient> | null = null; // Client for data fetching

if (supabaseUrl && anonKey) {
  supabase = createClient(supabaseUrl, anonKey);
} else {
  console.error("Profile GET Error: Supabase URL or Anon Key is missing.");
}
if (supabaseUrl && serviceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
} else {
  console.error("Profile GET Error: Supabase Service Role Key is missing.");
}
// --- End Initialization ---

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  // Check if clients are initialized
  if (!supabase || !supabaseAdmin) {
      console.error("Profile GET Error: Supabase client(s) not initialized.");
      return NextResponse.json({ error: { message: 'Server configuration error.' } }, { status: 500 });
  }

  try {
    // 1. Get JWT from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: { message: 'Authorization header missing or invalid.' } }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];

    // 2. Verify JWT and get user (using standard client)
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error("Profile GET Error: JWT verification failed:", userError);
      return NextResponse.json({ error: { message: 'Not authenticated or invalid token.' } }, { status: 401 });
    }
    // *** Add explicit logging of the user ID obtained from JWT ***
    console.log(`Profile GET API: Authenticated User ID from JWT: ${user?.id}`);

    // 3. Attempt to get profile data with retries (using ADMIN client)
    let profile = null;
    let profileError: any = null;
    const maxRetries = 3;
    const retryDelay = 500;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        // *** Log the ID being used in the query ***
        console.log(`Profile GET API: Attempt ${attempt} - Querying profiles table for id = ${user.id} (using admin client: ${!!supabaseAdmin})`);
        if (!supabaseAdmin) throw new Error("Admin client not available for query."); // Extra check

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select(`
                first_name,
                last_name,
                stripe_subscription_id,
                stripe_subscription_status,
                plan_type,
                extra_student_slots
            `)
            .eq('id', user.id) // Query using the ID from JWT auth
            .single();

        profileError = error;

        if (data) {
            profile = data;
            profileError = null;
            console.log(`Profile GET API: Success on attempt ${attempt}`);
            break;
        } else if (error && error.code === 'PGRST116') {
            console.warn(`Profile GET API: Profile not found on attempt ${attempt}. Retrying after ${retryDelay}ms...`);
            if (attempt < maxRetries) {
                await delay(retryDelay);
            }
        } else {
            console.error(`Profile GET API Error: Failed on attempt ${attempt} for user ${user.id}:`, profileError);
            break;
        }
    }

    // 4. Handle final result after retries
    if (!profile) {
        if (profileError && profileError.code === 'PGRST116') {
             console.warn(`Profile GET API: Profile still not found for user ${user.id} after ${maxRetries} attempts.`);
             return NextResponse.json({ error: { message: 'Profile data not yet available. Please try again shortly.' } }, { status: 404 });
        }
        console.error(`Profile GET API Error: Failed to retrieve profile for user ${user.id} after retries. Last error:`, profileError);
        return NextResponse.json({ error: { message: 'Failed to retrieve profile data.' } }, { status: 500 });
    }

    // 5. Return the profile data
    console.log(`Profile GET API: Returning profile data for user ${user.id}.`);
    return NextResponse.json(profile, { status: 200 });

  } catch (error: any) {
    console.error("Profile GET API Error (Outer Catch):", error);
    return NextResponse.json({ error: { message: 'An unexpected server error occurred.' } }, { status: 500 });
  }
}
