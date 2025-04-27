import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  throw new Error("Supabase URL or Anon Key is missing from environment variables.");
}

// Initialize Supabase Client (using anon key, RLS will be enforced)
const supabase = createClient(supabaseUrl, anonKey);

export async function GET(request: Request) {
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
      console.error("JWT verification error:", userError);
      return NextResponse.json({ error: { message: 'Not authenticated or invalid token.' } }, { status: 401 });
    }

    const teacherUserId = user.id;

    // 3. Verify the user has the 'teacher' role (optional but good practice)
    // This relies on the user being able to read their own profile via RLS.
    const { data: teacherProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', teacherUserId)
      .single();

    // Allow fetching even if profile check fails, RLS on the student query is the main security
    if (profileError) {
        console.warn("Could not fetch teacher profile to verify role, proceeding based on RLS.", profileError);
    } else if (teacherProfile?.role !== 'teacher') {
        return NextResponse.json({ error: { message: 'Forbidden: Only teachers can fetch student lists.' } }, { status: 403 });
    }

    // 4. Fetch students created by this teacher
    // RLS policy "Allow creators to read profiles they created" should handle security.
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, username, first_name, last_name, created_at') // Select desired fields
      .eq('created_by', teacherUserId) // Filter by the teacher's ID
      .order('created_at', { ascending: false }); // Optional: order by creation date

    if (studentsError) {
      console.error("Fetch students error:", studentsError);
      // Log specific error, return generic message
      return NextResponse.json({ error: { message: 'Failed to fetch student data.' } }, { status: 500 });
    }

    // 5. Return the list of students
    return NextResponse.json(students || [], { status: 200 });

  } catch (error: any) {
    console.error("API Get Students Error:", error);
    return NextResponse.json({ error: { message: 'An unexpected server error occurred.' } }, { status: 500 });
  }
}
