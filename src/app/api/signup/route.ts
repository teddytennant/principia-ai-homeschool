import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Assuming your Supabase client is here

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, role, recaptchaToken } = await request.json();

    // --- reCAPTCHA Verification ---
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY is not set in environment variables.");
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    const recaptchaResponse = await fetch(verificationUrl, { method: 'POST' });
    const recaptchaData = await recaptchaResponse.json();

    console.log("reCAPTCHA verification response:", recaptchaData); // Log for debugging

    // Check if verification was successful and score is sufficient (e.g., > 0.5 for v3)
    // Adjust the score threshold as needed based on your reCAPTCHA settings and testing.
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      return NextResponse.json({ message: 'CAPTCHA verification failed. Please try again.' }, { status: 400 });
    }
    // --- End reCAPTCHA Verification ---

    // --- Supabase Signup ---
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          role: role,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          // You might want to store the sign-up timestamp or other metadata here
        }
      }
    });

    if (signUpError) {
      console.error("Supabase sign-up error:", signUpError);
      // Provide a more specific error message if possible
      let errorMessage = signUpError.message;
      if (signUpError.message.includes("User already registered")) {
          errorMessage = "This email address is already registered.";
      } else if (signUpError.message.includes("Password should be at least 6 characters")) {
          errorMessage = "Password must be at least 6 characters long.";
      }
      return NextResponse.json({ message: `Sign-up failed: ${errorMessage}` }, { status: 400 });
    }

    if (!data.user) {
        // This case might indicate an issue post-signup but before user object is confirmed
        console.error("Supabase sign-up finished, but no user data returned.");
        return NextResponse.json({ message: 'Sign-up process incomplete. Please try again or contact support.' }, { status: 500 });
    }
    // --- End Supabase Signup ---

    // Profile creation is handled by the trigger in Supabase based on auth.users table inserts.

    // Return success response
    // The user object might contain sensitive info, so only return what's necessary or just a success message.
    return NextResponse.json({ message: 'Sign-up successful! Please check your email to verify your account.' }, { status: 201 });

  } catch (error: any) {
    console.error("API Signup Error:", error);
    return NextResponse.json({ message: 'An unexpected error occurred during sign-up.' }, { status: 500 });
  }
}
