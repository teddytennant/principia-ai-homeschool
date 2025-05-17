import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use anon key for getUser
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; // Default for local dev

if (!stripeSecretKey || !supabaseUrl || !anonKey) {
  console.error("Missing required environment variables for Stripe checkout session creation.");
}

// Initialize Stripe
const stripe = new Stripe(stripeSecretKey || '');

// Initialize Supabase Client (using anon key for user verification)
const supabase = createClient(supabaseUrl!, anonKey!);

export async function POST(req: NextRequest) {
  // Check required env vars again within the request context
  if (!stripeSecretKey || !supabaseUrl || !anonKey) {
      console.error("Checkout Session Error: Server configuration missing required environment variables.");
      return NextResponse.json({ error: { message: 'Server configuration error.' } }, { status: 500 });
  }

  try {
    // 1. Get Price ID from request body
    const { priceId } = await req.json();
    if (!priceId) {
      return NextResponse.json({ error: { message: 'Price ID is required' } }, { status: 400 });
    }

    // 2. Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // If checking out from pricing page before login, this might fail.
      // Consider alternative flow or requiring login before checkout.
      // For now, assume user MUST be logged in to checkout.
      console.warn("Checkout Session: Authorization header missing or invalid.");
      return NextResponse.json({ error: { message: 'Authorization header missing or invalid. Please log in.' } }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];

    // 3. Verify JWT and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error("Checkout Session Error: JWT verification failed:", userError);
      return NextResponse.json({ error: { message: 'Not authenticated or invalid token.' } }, { status: 401 });
    }

    // 4. Get user's profile to check for existing Stripe Customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    // Handle profile fetch errors (though profile should exist)
    if (profileError && profileError.code !== 'PGRST116') { // Ignore "Not Found" error initially
        console.error(`Checkout Session Error: Failed to retrieve profile for user ${user.id}:`, profileError);
        return NextResponse.json({ error: { message: 'Failed to retrieve user profile.' } }, { status: 500 });
    }

    const existingStripeCustomerId = profile?.stripe_customer_id;

    // 5. Prepare Stripe session parameters
    // Redirect to the new intermediate success page, passing the session ID
    const successUrl = `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/pricing`; // Redirect back to pricing page on cancellation

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        // IMPORTANT: Associate with user
        // If customer ID exists, use it. Otherwise, use email to find/create customer.
        ...(existingStripeCustomerId
            ? { customer: existingStripeCustomerId }
            : { customer_email: user.email }
        ),
        // Optionally pass Supabase user ID for easier webhook linking if needed
        client_reference_id: user.id,
        metadata: { supabase_user_id: user.id },
    };

    // 6. Create the Stripe Checkout Session
    console.log(`Creating Stripe session for user ${user.id} with price ${priceId}...`);
    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.id) {
        throw new Error('Failed to create Stripe session.');
    }

    // 7. Return the session ID to the client
    console.log(`Stripe session created: ${session.id}`);
    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    // Provide more specific error if it's a Stripe error
     if (typeof error === 'object' && error !== null && 'type' in error && typeof error.type === 'string' && error.type.startsWith('Stripe')) {
         return NextResponse.json({ error: `Stripe Error: ${errorMessage}` }, { status: 400 }); // Use 400 for Stripe API errors
     }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
