import { NextResponse } from 'next/server';
// Removed duplicate NextResponse import
import { createClient as createAdminClient } from '@supabase/supabase-js'; // Alias for admin client
import { createRouteHandlerClient } from '@supabase/ssr'; // Correct import for user client in Route Handlers
import { cookies } from 'next/headers';

// Define the structure for student data returned by GET
interface StudentProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  // Add other relevant fields from profiles if needed
}

// --- Get Supabase Admin Client ---
// IMPORTANT: Only use the admin client in secure backend environments.
// Never expose the service role key to the frontend.
const getSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase URL or Service Role Key is missing in environment variables.');
  }
  // Create a new client instance with the service role key for admin actions
  // Use the aliased import
  return createAdminClient(supabaseUrl, serviceKey, {
    auth: {
      // Explicitly state that we are using the service key for admin actions
      autoRefreshToken: false, // Recommended for service key
      // persistSession: false // Not needed for service key
    }
  });
};

// --- GET Handler: List students created by the logged-in user ---
export async function GET(request: Request) {
  const cookieStore = cookies();
  // Create the user client using the ssr helper for Route Handlers
  const supabaseUserClient = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // 1. Get the current logged-in user's ID
    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      console.error("GET /api/manage-students: User fetch error", userError);
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }
    const creatorId = user.id; // Define creatorId once

    // 2. Fetch profiles where 'created_by' matches the logged-in user's ID
    // Use the user client (supabaseUserClient) to respect RLS
    // Use the user client here to ensure RLS is respected (creator can only see profiles they created)
    const { data: profiles, error: fetchError } = await supabaseUserClient
      .from('profiles')
      .select('id, username, first_name, last_name, created_at') // Select desired fields
      .eq('created_by', creatorId)
      .order('created_at', { ascending: false }); // Order by creation date

    if (fetchError) {
      console.error("GET /api/manage-students: Fetch error", fetchError);
      return NextResponse.json({ message: `Failed to fetch students: ${fetchError.message}` }, { status: 500 });
    }

    return NextResponse.json(profiles as StudentProfile[], { status: 200 });

  } catch (error: any) {
    console.error("GET /api/manage-students: Unexpected error", error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}


// --- POST Handler: Create a new student account ---
export async function POST(request: Request) {
  const cookieStore = cookies();
  // Create the user client using the ssr helper for Route Handlers
  const supabaseUserClient = createRouteHandlerClient({ cookies: () => cookieStore });
  const supabaseAdmin = getSupabaseAdminClient(); // Admin client for privileged actions

  try {
    // 1. Get the current logged-in user's ID (the creator)
    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      console.error("POST /api/manage-students: User fetch error", userError);
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }
    const creatorId = user.id;

    // 2. Get student details from request body
    const { username, password, firstName, lastName } = await request.json();

    if (!username || !password || !firstName || !lastName) {
      return NextResponse.json({ message: 'Missing required fields: username, password, firstName, lastName.' }, { status: 400 });
    }

    // Basic validation (add more as needed)
    if (password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }
    // Consider adding username format validation

    // 3. Construct dummy email
    // Ensure this domain is unlikely to clash with real emails and maybe add to Supabase redirect allowlist if needed
    const dummyEmail = `${username.trim().toLowerCase()}@managed.principia.ai`;

    // 4. Create the user using the Admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: dummyEmail,
      password: password,
      email_confirm: true, // Mark email as confirmed since it's not a real email
      user_metadata: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role: 'student', // Set role directly in metadata
        // Add any other metadata needed for the handle_new_user trigger
      },
    });

    if (createError) {
      console.error("POST /api/manage-students: Create user error", createError);
       // Check for specific errors like username/email collision
       if (createError.message.includes('duplicate key value violates unique constraint')) {
           // This could be the dummy email or potentially another constraint
           return NextResponse.json({ message: 'Username might already be taken or another conflict occurred.' }, { status: 409 }); // 409 Conflict
       }
      return NextResponse.json({ message: `Failed to create student account: ${createError.message}` }, { status: 500 });
    }

    if (!newUser || !newUser.user) {
        console.error("POST /api/manage-students: User creation finished, but no user data returned.");
        return NextResponse.json({ message: 'Student account creation incomplete.' }, { status: 500 });
    }

    const studentUserId = newUser.user.id;

    // 5. Update the newly created profile (via trigger) to set username and created_by
    // The trigger 'handle_new_user' should have already created the profile row.
    // We use the admin client again for this update.
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        username: username.trim(),
        created_by: creatorId,
        // Update other fields if necessary, ensure trigger doesn't overwrite needed metadata
      })
      .eq('id', studentUserId)
      .select('id, username, first_name, last_name, created_at') // Select fields to return
      .single(); // Expecting a single row

    if (updateError) {
      console.error("POST /api/manage-students: Update profile error", updateError);
      // Consider deleting the auth user if profile update fails to avoid orphaned accounts
      // await supabaseAdmin.auth.admin.deleteUser(studentUserId); // Uncomment carefully
      return NextResponse.json({ message: `Student account created, but failed to update profile: ${updateError.message}` }, { status: 500 });
    }

    if (!updatedProfile) {
        console.error("POST /api/manage-students: Profile update finished, but no profile data returned.");
        return NextResponse.json({ message: 'Student account created, but profile update confirmation failed.' }, { status: 500 });
    }

    // 6. Return the newly created student profile data
    return NextResponse.json(updatedProfile as StudentProfile, { status: 201 }); // 201 Created

  } catch (error: any) {
    console.error("POST /api/manage-students: Unexpected error", error);
    // Check for JSON parsing errors specifically
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
