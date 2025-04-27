import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Define validation schema
const changePasswordSchema = z.object({
  // currentPassword: z.string().min(1, { message: "Current password is required" }), // Verification happens via re-authentication implicitly
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters long" }),
});

// Ensure environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  throw new Error("Supabase URL or Anon Key is missing from environment variables.");
}

// Initialize Supabase Client (using anon key, RLS will be enforced for profile checks if needed)
const supabase = createClient(supabaseUrl, anonKey);

export async function POST(request: Request) {
  try {
    // 1. Get JWT from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: { message: 'Authorization header missing or invalid.' } }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];

    // 2. Verify JWT and get user - This confirms the user is logged in
    // The updateUser call itself requires the user to be authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error("JWT verification error:", userError);
      return NextResponse.json({ error: { message: 'Not authenticated or invalid token.' } }, { status: 401 });
    }

    // 3. Parse and validate request body for the new password
    const rawBody = await request.json();
    const validationResult = changePasswordSchema.safeParse(rawBody);

    if (!validationResult.success) {
      console.error("Change password validation failed:", validationResult.error.flatten());
      return NextResponse.json(
        { error: { message: "Invalid input.", details: validationResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    // Use validated data
    const { newPassword } = validationResult.data;

    // 4. Update the user's password using Supabase Auth
    // Supabase handles the requirement for recent authentication implicitly here.
    // If the user's session is too old, this call might fail, prompting re-authentication.
    const { error: updateError } = await supabase.auth.updateUser(
        { password: newPassword },
        // Optional: Pass JWT explicitly if needed, though getUser should establish session context
        // { jwt: jwt }
    );


    if (updateError) {
      console.error("Password update error:", updateError);
      // Provide a more specific error if possible, e.g., weak password
      if (updateError.message.includes('Password should be at least 6 characters')) {
           return NextResponse.json({ error: { message: 'New password must be at least 6 characters long.' } }, { status: 400 });
      }
       if (updateError.message.includes('requires recent login')) {
           return NextResponse.json({ error: { message: 'Password change requires recent login. Please sign in again.' } }, { status: 401 }); // Or 403
       }
      // Generic error
      return NextResponse.json({ error: { message: `Failed to update password: ${updateError.message}` } }, { status: 500 });
    }

    // 5. Return success response
    return NextResponse.json({ message: 'Password updated successfully.' }, { status: 200 });

  } catch (error: any) {
    // Handle potential JSON parsing errors specifically
    if (error instanceof SyntaxError) {
        console.error("API Change Password Error: Invalid JSON body", error);
        return NextResponse.json({ error: { message: 'Invalid request body format.' } }, { status: 400 });
    }
    // Handle Zod errors during parsing (though safeParse should prevent this)
    if (error instanceof z.ZodError) {
        console.error("API Change Password Error: Zod validation failed unexpectedly", error.flatten());
        return NextResponse.json({ error: { message: "Invalid input.", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    // Handle generic errors
    console.error("API Change Password Error:", error);
    return NextResponse.json({ error: { message: 'An unexpected server error occurred.' } }, { status: 500 });
  }
}
