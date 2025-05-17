import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase Client (using anon key, RLS will be enforced)
let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && anonKey) {
    supabase = createClient(supabaseUrl, anonKey);
} else {
    console.error("Get Parent Students Error at module load: Supabase URL or Anon Key missing.");
}

export async function GET(request: Request) {
  // Check env vars and client initialization again inside the handler
  if (!supabaseUrl || !anonKey || !supabase) {
      console.error("Get Parent Students Error: Supabase client not initialized or env vars missing inside GET handler.");
      return NextResponse.json({ error: { message: 'Server configuration error.' } }, { status: 500 });
  }
  try {
    // 1. Get JWT from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: { message: 'Authorization header missing or invalid.' } }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];

    // 2. Verify JWT and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error("Get Parent Students Error: JWT verification failed:", userError);
      return NextResponse.json({ error: { message: 'Not authenticated or invalid token.' } }, { status: 401 });
    }

    const parentUserId = user.id;

    // 3. Verify the user has the 'parent' role (optional but good practice)
    const { data: parentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', parentUserId)
      .single();

    if (profileError) {
        console.warn(`Get Parent Students Warning: Could not fetch parent profile for user ${parentUserId} to verify role. Proceeding based on RLS. Error:`, profileError);
    } else if (parentProfile?.role !== 'parent') {
        console.warn(`Get Parent Students Forbidden: User ${parentUserId} with role ${parentProfile?.role} attempted to fetch students.`);
        return NextResponse.json({ error: { message: 'Forbidden: Only parents can fetch their student lists.' } }, { status: 403 });
    }

    // 4. Fetch student profiles created by this parent
    console.log(`Get Parent Students: Fetching students created by parent ${parentUserId}.`);
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, username, first_name, last_name, created_at')
      .eq('created_by', parentUserId)
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (studentsError) {
      console.error(`Get Parent Students Error: Fetch students failed for parent ${parentUserId}:`, studentsError);
      return NextResponse.json({ error: { message: 'Failed to fetch student data.' } }, { status: 500 });
    }

    console.log(`Get Parent Students: Found ${students?.length || 0} students for parent ${parentUserId}.`);

    // 5. Return the list of students with no-store cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return NextResponse.json(students || [], { status: 200, headers: headers });

  } catch (error: any) {
    console.error("API Get Parent Students Error (Outer Catch):", error);
    return NextResponse.json({ error: { message: 'An unexpected server error occurred.' } }, { status: 500 });
  }
}
