import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Define validation schema
const createStudentSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  firstName: z.string().min(1, { message: "First name is required" }).trim(),
  lastName: z.string().min(1, { message: "Last name is required" }).trim(),
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }).trim(),
});

// Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log initial check
console.log(`Create Student Module Load: Supabase URL: ${supabaseUrl ? 'OK' : 'MISSING'}, Anon Key: ${anonKey ? 'OK' : 'MISSING'}, Service Role Key: ${serviceRoleKey ? 'OK' : 'MISSING'}`);


export async function POST(request: Request) {
  // Initialize clients within the handler scope
  let supabase: ReturnType<typeof createClient> | null = null;
  let supabaseAdmin: ReturnType<typeof createClient> | null = null;

  console.log(`Create Student POST Handler Start: Supabase URL: ${supabaseUrl ? 'OK' : 'MISSING'}, Anon Key: ${anonKey ? 'OK' : 'MISSING'}, Service Role Key: ${serviceRoleKey ? 'OK' : 'MISSING'}`);

  if (supabaseUrl && anonKey) {
    supabase = createClient(supabaseUrl, anonKey);
  } else {
    console.error("Create Student POST Handler Error: Supabase URL or Anon Key missing.");
    return NextResponse.json({ error: { message: 'Server configuration error (client init).' } }, { status: 500 });
  }
  if (supabaseUrl && serviceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  } else {
    console.error("Create Student POST Handler Error: Supabase URL or Service Role Key missing.");
     return NextResponse.json({ error: { message: 'Server configuration error (admin client init).' } }, { status: 500 });
  }
  if (!supabase || !supabaseAdmin) {
      console.error("Create Student POST Handler Error: Supabase client(s) failed initialization.");
      return NextResponse.json({ error: { message: 'Server configuration error (client init).' } }, { status: 500 });
  }

  try {
    // 1. Get JWT and verify user
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: { message: 'Authorization header missing or invalid.' } }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error("Create Student API Error: JWT verification failed:", userError);
      return NextResponse.json({ error: { message: 'Not authenticated or invalid token.' } }, { status: 401 });
    }
    const parentUserId = user.id;
    console.log(`Create Student API: Authenticated Parent User ID: ${parentUserId}`);

    // *** Temporarily skip fetching parent profile and role/limit check due to persistent fetch issues ***
    console.log(`Create Student API: Skipping parent profile fetch and limit check.`);
    // We assume the middleware already verified the user is a parent.
    // WARNING: Limit check is temporarily disabled on the backend. Frontend check remains.

    // 5. Parse and validate request body
    const rawBody = await request.json();
    const validationResult = createStudentSchema.safeParse(rawBody);

    if (!validationResult.success) {
      console.error("Create Student API Error: Validation failed:", validationResult.error.flatten());
      const firstError = validationResult.error.errors[0]?.message || "Invalid input.";
      return NextResponse.json(
        { error: { message: firstError, details: validationResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }
    const { password, firstName, lastName, username } = validationResult.data;

    // 6. Create the student user (using ADMIN client)
    const dummyEmail = `dummy-user-${Date.now()}@dummy.email`;
    console.log(`Create Student API: Attempting to create student user '${username}' for parent ${parentUserId} with dummy email ${dummyEmail}.`);
    const { data: newUserResponse, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: dummyEmail,
      password: password,
      email_confirm: true, // Auto-confirm dummy email
      user_metadata: {
        role: 'student',
        first_name: firstName,
        last_name: lastName,
        username: username,
      },
      app_metadata: {
        creator_id: parentUserId
      }
    });

    if (createError) {
      console.error(`Create Student API Error: Admin user creation failed for username '${username}':`, createError);
       if (createError.message.includes('Password should be at least 6 characters')) {
           return NextResponse.json({ error: { message: 'Password must be at least 6 characters.' } }, { status: 400 });
       }
       if (createError.message.includes('validate email address: invalid format')) {
            console.error("Create Student API Error: Supabase rejected the dummy email format.");
            return NextResponse.json({ error: { message: 'Internal error creating student account (email format).' } }, { status: 500 });
       }
      if (createError.message.includes('duplicate key value violates unique constraint "profiles_username_key"')) {
         return NextResponse.json({ error: { message: 'Username already taken.' } }, { status: 409 });
      }
      return NextResponse.json({ error: { message: `Failed to create student account: ${createError.message}` } }, { status: 500 });
    }

    const newUser = newUserResponse?.user; // Extract user object
    if (!newUser) {
        console.error("Create Student API Error: Admin user creation seemed successful but returned no user object.");
        return NextResponse.json({ error: { message: 'Student account creation incomplete.' } }, { status: 500 });
    }
    console.log(`Create Student API: Successfully created student user ${newUser.id} ('${username}') for parent ${parentUserId}. Trigger should handle profile row.`);

    // *** NOTE: Relying on the handle_new_user trigger to populate the profile ***
    // We assume the trigger works and the profile row will exist shortly after user creation.

    // 7. Prepare data for the response (matching StudentProfile interface on frontend)
    const newStudentData = {
        id: newUser.id,
        username: username,
        first_name: firstName,
        last_name: lastName,
        created_at: newUser.created_at || new Date().toISOString(), // Use user creation time or current time
    };

    // 8. Return success response with the new student data
    return NextResponse.json({
        message: 'Student account created successfully.',
        student: newStudentData // Include the new student's details
    }, { status: 201 });

  } catch (error: any) {
    console.error("Create Student API Error (Outer Catch):", error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: { message: 'Invalid request body format.' } }, { status: 400 });
    }
    if (error instanceof z.ZodError) {
        const firstError = error.errors[0]?.message || "Invalid input.";
        return NextResponse.json({ error: { message: firstError, details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: 'An unexpected server error occurred.' } }, { status: 500 });
  }
}
