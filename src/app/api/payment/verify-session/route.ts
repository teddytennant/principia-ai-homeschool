import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// --- Plan Price IDs ---
const STRIPE_PRICE_IDS = {
  family: { monthly: 'price_1RHqp5JeqDgVC0pzC2syW4AK', yearly: 'price_1RHtQ6JeqDgVC0pzzTsrMKrw' },
  coop: { monthly: 'price_1RHtHgJeqDgVC0pzMfSjR81F', yearly: 'price_1RHtOpJeqDgVC0pzI0ombSIs' },
  individual: { monthly: 'price_1RHtE3JeqDgVC0pz1vqgNtO1', yearly: 'price_1RHtO1JeqDgVC0pzn7FOz15G' },
  additional_slot: 'price_1RIVYbJeqDgVC0pzlaR3NAQb',
};
const PLAN_MAP: { [key: string]: string | null } = {
  [STRIPE_PRICE_IDS.family.monthly]: 'family',
  [STRIPE_PRICE_IDS.family.yearly]: 'family',
  [STRIPE_PRICE_IDS.coop.monthly]: 'co-op',
  [STRIPE_PRICE_IDS.coop.yearly]: 'co-op',
  [STRIPE_PRICE_IDS.individual.monthly]: 'individual',
  [STRIPE_PRICE_IDS.individual.yearly]: 'individual',
};
// --- End Plan Price IDs ---

// --- Environment Variables ---
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// --- End Environment Variables ---

// --- Initialization ---
let stripe: Stripe | null = null;
if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey);
} else {
  console.error("Stripe secret key is missing.");
}

let supabaseAdmin: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && serviceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
} else {
  console.error("Supabase URL or Service Role Key is missing.");
}
// --- End Initialization ---

// Helper function to process subscription data (copied from webhook)
const processSubscriptionData = (subscription: Stripe.Subscription): { planType: string | null, extraSlots: number } => {
    let planType: string | null = null;
    let extraSlots = 0;
    if (!subscription?.items?.data) return { planType, extraSlots };
    for (const item of subscription.items.data) {
        const priceId = item.price.id;
        if (PLAN_MAP[priceId]) planType = PLAN_MAP[priceId];
        else if (priceId === STRIPE_PRICE_IDS.additional_slot) extraSlots = item.quantity || 0;
    }
    return { planType, extraSlots };
};

export async function POST(req: NextRequest) {
  if (!stripe || !supabaseAdmin) {
      console.error("Verify Session Error: Server configuration missing required Stripe/Supabase clients.");
      return NextResponse.json({ error: { message: 'Server configuration error.' } }, { status: 500 });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: { message: 'Stripe Session ID is required.' } }, { status: 400 });
    }

    console.log(`Verify Session API: Verifying session ID: ${sessionId}`);

    // 1. Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'subscription.items.data.price', 'customer'],
    });
    console.log(`Verify Session API: Retrieved session. Payment Status: ${session.payment_status}`);

    // 2. Check session status
    if (session.payment_status !== 'paid') {
        console.warn(`Verify Session API: Session ${sessionId} payment status is ${session.payment_status}.`);
        return NextResponse.json({ error: { message: 'Payment not completed.' } }, { status: 402 });
    }

    // 3. Extract necessary data
    const subscription = session.subscription as Stripe.Subscription | null;
    const customer = session.customer as Stripe.Customer | null;
    const supabaseUserId = session.metadata?.supabase_user_id;

    if (!subscription || !customer) {
        console.error(`Verify Session API Error: Missing critical data in session ${sessionId}. Sub: ${!!subscription}, Cust: ${!!customer}`);
        return NextResponse.json({ error: { message: 'Incomplete session data.' } }, { status: 400 });
    }

    // If supabaseUserId is not available, still return success but log the issue
    if (!supabaseUserId) {
        console.warn(`Verify Session API Warning: Missing Supabase User ID in session ${sessionId}. Payment verified but profile update skipped.`);
        return NextResponse.json({ success: true, message: 'Payment verified, but user association incomplete. Please sign in to complete setup.' }, { status: 200 });
    }
    
    console.log(`Verify Session API: Found Supabase User ID: ${supabaseUserId}`);

    // 4. Process subscription items
    const { planType, extraSlots } = processSubscriptionData(subscription);
    const statusToSave = 'active'; // Since payment_status is 'paid'

    // 5. Prepare data and attempt Supabase profile update
    const dataToUpdate = {
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        stripe_subscription_status: statusToSave,
        plan_type: planType,
        extra_student_slots: extraSlots,
    };
    console.log(`Verify Session API: Preparing to update profile for user ${supabaseUserId} with data:`, dataToUpdate);

    const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', supabaseUserId);

    // 6. Check update result and return response
    if (updateError) {
        console.error(`Verify Session API Error: Failed to update profile for user ${supabaseUserId}:`, updateError);
        // Return error but maybe allow frontend to retry or inform user
        return NextResponse.json({ error: { message: 'Failed to update profile status after payment.' } }, { status: 500 });
    }

    console.log(`Verify Session API: Successfully updated profile for user ${supabaseUserId}.`);
    return NextResponse.json({ success: true, message: 'Subscription activated.' }, { status: 200 });

  } catch (error: any) {
    console.error("Verify Session API Error:", error);
    if (error.type && error.statusCode) { // Stripe specific error
        return NextResponse.json({ error: { message: `Stripe API Error: ${error.message}` } }, { status: error.statusCode });
    }
    // Generic error
    return NextResponse.json({ error: { message: `Verification failed: ${error.message || 'Unknown error'}` } }, { status: 500 });
  }
}
