import { NextResponse } from 'next/server'; // Ensure NextResponse is imported
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod'; // Import zod

// Define validation schema
const updateProfileSchema = z.object({
  firstName: z.string().min(1, { message: "First name cannot be empty" }).trim(),
  lastName: z.string().min(1, { message: "Last name cannot be empty" }).trim(),
});

// Ensure environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  throw new Error("Supabase URL or Anon Key is missing from environment variables.");
}

// Initialize Supabase Client (using anon key, RLS will be enforced)
const supabase = createClient(supabaseUrl, anonKey);

export async function POST(request: Request) {
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

    const userId = user.id;

    // 3. Parse and validate request body
    const rawBody = await request.json();
    const validationResult = updateProfileSchema.safeParse(rawBody);

    if (!validationResult.success) {
      console.error("Update profile validation failed:", validationResult.error.flatten());
      return NextResponse.json(
        { error: { message: "Invalid input.", details: validationResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    // Use validated data
    const { firstName, lastName } = validationResult.data;

    // 4. Update the user's profile in the 'profiles' table
    // RLS policy "Allow users to update their own profile (specific columns)" should permit this.
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName, // Already trimmed by zod
        last_name: lastName,   // Already trimmed by zod
        // Add other updatable fields here if needed, e.g., updated_at timestamp
      })
      .eq('id', userId); // Ensure only the authenticated user's profile is updated

    if (updateError) {
      console.error("Profile update error:", updateError);
      // Log specific error, return generic message
      return NextResponse.json({ error: { message: 'Failed to update profile.' } }, { status: 500 });
    }

    // 5. Return success response
    return NextResponse.json({ message: 'Profile updated successfully.' }, { status: 200 });

  } catch (error: any) {
    // Handle potential JSON parsing errors specifically
    if (error instanceof SyntaxError) {
        console.error("API Update Profile Error: Invalid JSON body", error);
        return NextResponse.json({ error: { message: 'Invalid request body format.' } }, { status: 400 });
    }
    // Handle Zod errors during parsing (though safeParse should prevent this)
    if (error instanceof z.ZodError) {
        console.error("API Update Profile Error: Zod validation failed unexpectedly", error.flatten());
        return NextResponse.json({ error: { message: "Invalid input.", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    // Handle generic errors
    console.error("API Update Profile Error:", error);
    return NextResponse.json({ error: { message: 'An unexpected server error occurred.' } }, { status: 500 });
  }
}
