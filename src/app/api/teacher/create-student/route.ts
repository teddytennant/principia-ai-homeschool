import { NextResponse } from 'next/server';
// Removed createServerClient and cookies imports as we'll use JWT
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod'; // Import zod

// Define validation schema
const createStudentSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  firstName: z.string().min(1, { message: "First name is required" }).trim(),
  lastName: z.string().min(1, { message: "Last name is required" }).trim(),
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }).trim(), // Add username validation
});

// Ensure environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Need anon key for getUser
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  throw new Error("Supabase URL, Anon Key, or Service Role Key is missing from environment variables.");
}

// Initialize Supabase Client for user verification (using anon key)
const supabase = createClient(supabaseUrl, anonKey);

// Initialize Supabase Admin Client (using service role key)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: Request) {
  try {
    // 1. Get JWT from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: { message: 'Authorization header missing or invalid.' } }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];

    // 2. Verify JWT and get user using standard client
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error("JWT verification error:", userError);
      return NextResponse.json({ error: { message: 'Not authenticated or invalid token.' } }, { status: 401 });
    }

    const teacherUserId = user.id;

    // 3. Verify the user has the 'teacher' role
    // Fetch profile using the standard client (which respects RLS for the calling user)
    // Note: If RLS prevents fetching other profiles, this might need adjustment,
    // but typically users can read their own profile.
    const { data: teacherProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', teacherUserId)
      .single();

    if (profileError || !teacherProfile) {
      console.error("Teacher profile fetch error:", profileError);
      // Log the actual error but return a generic message
      return NextResponse.json({ error: { message: 'Could not verify user role.' } }, { status: 403 });
    }

    if (teacherProfile.role !== 'teacher') {
      return NextResponse.json({ error: { message: 'Forbidden: Only teachers can create students.' } }, { status: 403 });
    }

    // 4. Parse and validate request body
    const rawBody = await request.json();
    const validationResult = createStudentSchema.safeParse(rawBody);

    if (!validationResult.success) {
      // Log validation errors for debugging
      console.error("Create student validation failed:", validationResult.error.flatten());
      // Return validation errors to the client in a structured format
      return NextResponse.json(
        { error: { message: "Invalid input.", details: validationResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    // Use validated data from now on
    const { email, password, firstName, lastName, username } = validationResult.data;

    // 5. Create the student user using the Admin Client (using validated data)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email, // Already trimmed by zod schema
      password: password, // Password validation done by zod
      email_confirm: true, // Automatically confirm email for teacher-created students
      user_metadata: {
        role: 'student', // Set role in user_metadata
        first_name: firstName, // Already trimmed
        last_name: lastName,   // Already trimmed
        username: username,     // Already trimmed
      },
      app_metadata: {
        creator_id: teacherUserId // Pass teacher's ID in app_metadata
      }
    });

    if (createError) {
      console.error("Admin user creation error:", createError);
      // Check for specific errors like duplicate email/username
      if (createError.message.includes('duplicate key value violates unique constraint "profiles_username_key"')) {
         return NextResponse.json({ error: { message: 'Username already taken.' } }, { status: 409 }); // 409 Conflict
      }
      if (createError.message.includes('User already registered')) {
         return NextResponse.json({ error: { message: 'Email address already registered.' } }, { status: 409 });
      }
      // Generic error for other issues - log specific error but return generic message
      return NextResponse.json({ error: { message: 'Failed to create student account.' } }, { status: 500 });
    }

    if (!newUser || !newUser.user) {
        console.error("Admin user creation seemed successful but returned no user object.");
        return NextResponse.json({ error: { message: 'Student account creation incomplete.' } }, { status: 500 });
    }

    // 6. Return success response
    // Avoid sending back sensitive info like the full user object
    return NextResponse.json({ message: 'Student account created successfully.' }, { status: 201 });

  } catch (error: any) {
    // Handle potential JSON parsing errors specifically
    if (error instanceof SyntaxError) {
        console.error("API Create Student Error: Invalid JSON body", error);
        return NextResponse.json({ error: { message: 'Invalid request body format.' } }, { status: 400 });
    }
    // Handle Zod errors during parsing (though safeParse should prevent this)
    if (error instanceof z.ZodError) {
        console.error("API Create Student Error: Zod validation failed unexpectedly", error.flatten());
        return NextResponse.json({ error: { message: "Invalid input.", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    // Handle generic errors
    console.error("API Create Student Error:", error);
    return NextResponse.json({ error: { message: 'An unexpected server error occurred.' } }, { status: 500 });
  }
}
