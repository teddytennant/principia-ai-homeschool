import { NextResponse } from 'next/server';
import Stripe from 'stripe';
// Remove import of headers from next/headers
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
  console.error("Missing required environment variables for Stripe webhook.");
  // Avoid throwing error here in production, return error response instead
  // throw new Error("Server configuration error: Missing Stripe or Supabase environment variables.");
}

// Initialize Stripe (removing explicit apiVersion to use library default)
const stripe = new Stripe(stripeSecretKey || ''); // Provide default empty string

// Initialize Supabase Admin Client (needed to update profiles regardless of RLS)
const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!); // Use non-null assertion assuming check above

// Helper function to update profile based on Stripe customer ID
const updateProfileByCustomerId = async (customerId: string, dataToUpdate: object) => {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update(dataToUpdate)
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error(`Error updating profile for customer ${customerId}:`, error);
  } else {
    console.log(`Successfully updated profile for customer ${customerId} with data:`, dataToUpdate);
  }
};

// Helper function to update profile based on Stripe subscription ID
const updateProfileBySubscriptionId = async (subscriptionId: string, dataToUpdate: object) => {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update(dataToUpdate)
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error(`Error updating profile for subscription ${subscriptionId}:`, error);
    } else {
        console.log(`Successfully updated profile for subscription ${subscriptionId} with data:`, dataToUpdate);
    }
};


export async function POST(request: Request) {
  // Check required env vars again within the request context
  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
      console.error("Webhook Error: Server configuration missing required environment variables.");
      return NextResponse.json({ error: { message: 'Server configuration error.' } }, { status: 500 });
  }

  const body = await request.text(); // Need raw body for signature verification
  // Get signature directly from the request headers
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error("Webhook Error: Missing stripe-signature header.");
    return NextResponse.json({ error: { message: 'Missing stripe-signature header.' } }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Pass the guaranteed string signature and webhookSecret
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`Received Stripe event: ${event.type}`);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: { message: `Webhook Error: ${err.message}` } }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      // --- Subscription Events ---
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Handling subscription created: ${subscription.id} for customer ${subscription.customer}`);
        if (subscription.customer) {
            await updateProfileByCustomerId(subscription.customer as string, {
              stripe_subscription_id: subscription.id,
              stripe_subscription_status: subscription.status,
            });
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Handling subscription updated: ${subscription.id} Status: ${subscription.status}`);
         await updateProfileBySubscriptionId(subscription.id, {
           stripe_subscription_status: subscription.status,
         });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Handling subscription deleted: ${subscription.id} Status: ${subscription.status}`);
         await updateProfileBySubscriptionId(subscription.id, {
           stripe_subscription_status: subscription.status, // Should be 'canceled' or similar
         });
        break;
      }

      // --- Checkout Session Events ---
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Handling checkout session completed: ${session.id} for customer ${session.customer}`);
        if (session.mode === 'subscription' && session.subscription && session.customer) {
          // Update profile using customer ID from the session
          await updateProfileByCustomerId(session.customer as string, {
            stripe_subscription_id: session.subscription as string,
            stripe_subscription_status: 'active', // Assume active on completion
          });
        } else if (session.mode === 'payment') {
          console.log(`One-time payment checkout session completed: ${session.id}`);
        }
        break;
      }

      // --- Customer Events ---
       case 'customer.created': {
         const customer = event.data.object as Stripe.Customer;
         console.log(`Handling customer created: ${customer.id} Email: ${customer.email}`);
         // Link customer ID based on email if needed (e.g., if customer created outside checkout)
         // if (customer.email) {
         //    const { error } = await supabaseAdmin.from('profiles').update({ stripe_customer_id: customer.id }).eq('email', customer.email);
         //    if (error) console.error(`Webhook: Error linking customer ${customer.id} to profile by email ${customer.email}:`, error);
         // }
         break;
       }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
      console.error("Error handling Stripe webhook event:", error);
      return NextResponse.json({ error: { message: `Webhook handler error: ${error.message}` } }, { status: 500 });
  }
}
