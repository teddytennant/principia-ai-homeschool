import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use anon key for getUser
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; // Default for local dev

if (!stripeSecretKey || !supabaseUrl || !anonKey) {
  console.error("Missing required environment variables for Stripe portal link creation.");
  // Avoid throwing error here in production, return error response instead
}

// Initialize Stripe
const stripe = new Stripe(stripeSecretKey || '');

// Initialize Supabase Client (using anon key for user verification)
const supabase = createClient(supabaseUrl!, anonKey!);

export async function POST(request: Request) {
  // Check required env vars again within the request context
  if (!stripeSecretKey || !supabaseUrl || !anonKey) {
      console.error("Portal Link Error: Server configuration missing required environment variables.");
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
      console.error("Portal Link Error: JWT verification failed:", userError);
      return NextResponse.json({ error: { message: 'Not authenticated or invalid token.' } }, { status: 401 });
    }

    // 3. Create a Supabase client authenticated AS THE USER for RLS
    const supabaseUserClient = createClient(supabaseUrl!, anonKey!, {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // 4. Get stripe_customer_id using the user-authenticated client
    console.log(`Fetching profile for user ${user.id} using user-specific client...`);
    const { data: profile, error: profileError } = await supabaseUserClient // Use the user-specific client
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
        console.error(`Portal Link Error: Failed to retrieve profile for user ${user.id} even with user client:`, profileError);
        // Distinguish RLS failure from other errors if possible
        const message = profileError.code === 'PGRST116'
            ? 'Could not find billing profile (RLS check failed?).'
            : `Database error fetching profile: ${profileError.message}`;
        return NextResponse.json({ error: { message } }, { status: 404 }); // Keep 404 or use 500 for unexpected DB errors
    }
    if (!profile || !profile.stripe_customer_id) {
      console.error(`Portal Link Error: Profile found for user ${user.id}, but stripe_customer_id is missing.`);
      return NextResponse.json({ error: { message: 'Billing information incomplete for this user.' } }, { status: 404 }); // Specific error
    }

    const customerId = profile.stripe_customer_id;
    console.log(`Found Stripe Customer ID ${customerId} for user ${user.id}.`);

    // 5. Create a Stripe Billing Portal session
    const returnUrl = `${siteUrl}/settings`; // Redirect back to settings page after portal visit

    console.log(`Creating Stripe portal session for customer ${customerId}...`);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    console.log(`Stripe portal session created: ${portalSession.id}`);

    // 6. Return the portal session URL
    return NextResponse.json({ url: portalSession.url }, { status: 200 });

  } catch (error: any) {
    console.error("Portal Link Error (Outer Catch):", error);
     // Check if it's a Stripe API error
     if (error.type && error.statusCode) {
        return NextResponse.json({ error: { message: `Stripe API Error: ${error.message}` } }, { status: error.statusCode });
    }
    return NextResponse.json({ error: { message: 'An unexpected server error occurred.' } }, { status: 500 });
  }
}
