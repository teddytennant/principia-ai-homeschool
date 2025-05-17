import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// --- Plan Price IDs ---
const STRIPE_PRICE_IDS = {
  family: { monthly: 'price_1RHqp5JeqDgVC0pzC2syW4AK', yearly: 'price_1RHtQ6JeqDgVC0pzzTsrMKrw' },
  coop: { monthly: 'price_1RHtHgJeqDgVC0pzMfSjR81F', yearly: 'price_1RHtOpJeqDgVC0pzI0ombSIs' },
  individual: { monthly: 'price_1RHtE3JeqDgVC0pz1vqgNtO1', yearly: 'price_1RHtO1JeqDgVC0pzn7FOz15G' },
  additional_slot: 'price_1RIVYbJeqDgVC0pzlaR3NAQb', // Add-on Price ID
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
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
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

// --- Helper Functions ---
// Helper function to update profile based on Supabase User ID
const updateProfileByUserId = async (userId: string, dataToUpdate: Record<string, any>) => {
  if (!supabaseAdmin) {
    console.error("Supabase admin client not initialized in updateProfileByUserId.");
    return { error: new Error("Server configuration error.") };
  }
  console.log(`Attempting to update profile for Supabase user ID: ${userId}`, dataToUpdate);
  const { error } = await supabaseAdmin
    .from('profiles')
    .update(dataToUpdate)
    .eq('id', userId);

  if (error) {
    console.error(`Error updating profile for user ${userId}:`, error);
  } else {
    console.log(`Successfully updated profile for user ${userId}`);
  }
  return { error };
};

// Helper function to update profile based on Stripe Subscription ID
const updateProfileBySubscriptionId = async (subscriptionId: string, dataToUpdate: Record<string, any>) => {
    if (!supabaseAdmin) {
        console.error("Supabase admin client not initialized in updateProfileBySubscriptionId.");
        return { error: new Error("Server configuration error.") };
    }
    console.log(`Attempting to update profile by subscription ID: ${subscriptionId}`, dataToUpdate);
    const { error } = await supabaseAdmin
      .from('profiles')
      .update(dataToUpdate)
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error(`Error updating profile for subscription ${subscriptionId}:`, error);
    } else {
        console.log(`Successfully updated profile for subscription ${subscriptionId}`);
    }
    return { error };
};

// Helper function to process subscription data and extract plan/slots
const processSubscriptionData = (subscription: Stripe.Subscription): { planType: string | null, extraSlots: number } => {
    let planType: string | null = null;
    let extraSlots = 0;

    if (!subscription?.items?.data) {
        console.warn(`Subscription ${subscription.id} has no items data.`);
        return { planType, extraSlots };
    }

    for (const item of subscription.items.data) {
        const priceId = item.price.id;
        if (PLAN_MAP[priceId]) {
            planType = PLAN_MAP[priceId];
        } else if (priceId === STRIPE_PRICE_IDS.additional_slot) {
            extraSlots = item.quantity || 0;
        }
    }
    console.log(`Processed subscription ${subscription.id}: Plan=${planType}, ExtraSlots=${extraSlots}`);
    return { planType, extraSlots };
};
// --- End Helper Functions ---


// --- Webhook Handler ---
export async function POST(request: Request) {
  if (!stripe || !webhookSecret || !supabaseAdmin) {
      console.error("Webhook Error: Server configuration missing required Stripe/Supabase variables or clients.");
      return NextResponse.json({ error: { message: 'Server configuration error.' } }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error("Webhook Error: Missing stripe-signature header.");
    return NextResponse.json({ error: { message: 'Missing stripe-signature header.' } }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`Webhook Received: ${event.type}`);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: { message: `Webhook Error: ${err.message}` } }, { status: 400 });
  }

  // Handle the event
  try {
    const subscription = event.data.object as Stripe.Subscription;

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        console.log(`Webhook Handling: ${event.type} for Sub ID: ${subscription.id}`);
        const fullSubscription = await stripe.subscriptions.retrieve(subscription.id, {
            expand: ['items.data.price'],
        });
        const { planType, extraSlots } = processSubscriptionData(fullSubscription);
        const dataToUpdate = {
          stripe_subscription_status: subscription.status,
          plan_type: planType,
          extra_student_slots: extraSlots,
          ...(subscription.customer && { stripe_customer_id: subscription.customer as string }),
        };
        console.log(`Webhook: Data for update (by Sub ID ${subscription.id}):`, dataToUpdate);
        await updateProfileBySubscriptionId(subscription.id, dataToUpdate);
        break;
      }
      case 'customer.subscription.deleted': {
        console.log(`Webhook Handling: ${event.type} for Sub ID: ${subscription.id}`);
         const dataToUpdate = {
           stripe_subscription_status: subscription.status,
           plan_type: null,
           extra_student_slots: 0,
         };
         console.log(`Webhook: Data for update (by Sub ID ${subscription.id}):`, dataToUpdate);
         await updateProfileBySubscriptionId(subscription.id, dataToUpdate);
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Webhook Handling: ${event.type} for Session ID: ${session.id}, Customer: ${session.customer}`);
        if (session.mode === 'subscription' && session.subscription && session.customer) {
           const fullSubscription = await stripe.subscriptions.retrieve(session.subscription as string, {
               expand: ['items.data.price'],
           });
           const { planType, extraSlots } = processSubscriptionData(fullSubscription);
           const statusToSave = session.payment_status === 'paid' ? 'active' : fullSubscription.status;
           console.log(`Webhook: Checkout complete. Payment status: ${session.payment_status}. Sub status: ${fullSubscription.status}. Saving status as: ${statusToSave}`);

           const supabaseUserId = session.metadata?.supabase_user_id;
           const dataToUpdate = {
               stripe_customer_id: session.customer as string,
               stripe_subscription_id: session.subscription as string,
               stripe_subscription_status: statusToSave,
               plan_type: planType,
               extra_student_slots: extraSlots,
           };
           console.log("Webhook: Data to update:", dataToUpdate);

           if (!supabaseUserId) {
               console.error(`Webhook Error: Missing supabase_user_id in metadata for checkout session ${session.id}. Attempting fallback update by Customer ID.`);
               // Fallback update by Customer ID
               const { error: fallbackUpdateError } = await updateProfileByUserId(session.customer as string, dataToUpdate); // Using updateProfileByUserId for fallback too
               if (fallbackUpdateError) {
                   console.error(`Webhook Fallback Update Error (by Customer ID ${session.customer}):`, fallbackUpdateError);
               } else {
                   console.log(`Webhook Fallback Update Success (by Customer ID ${session.customer})`);
               }
           } else {
               console.log(`Webhook: Updating profile for Supabase user ID: ${supabaseUserId}`);
               // Primary update by Supabase User ID
               const { error: updateError } = await updateProfileByUserId(supabaseUserId, dataToUpdate);
               if (updateError) {
                   console.error(`Webhook Error: Failed to update profile for user ${supabaseUserId}:`, updateError);
               } else {
                   console.log(`Webhook: Successfully updated profile for user ${supabaseUserId}`);
               }
           }
        } else if (session.mode === 'payment') {
          console.log(`Webhook Handling: One-time payment checkout session completed: ${session.id}`);
        }
        break;
      }
      case 'customer.created': {
         const customer = event.data.object as Stripe.Customer;
         console.log(`Webhook Handling: ${event.type} for Customer ID: ${customer.id}, Email: ${customer.email}`);
         if (customer.email) {
            const dataToUpdate = { stripe_customer_id: customer.id };
            console.log(`Webhook: Attempting to link customer ${customer.id} to profile by email ${customer.email}`);
            const { error } = await supabaseAdmin
                .from('profiles')
                .update(dataToUpdate)
                .eq('email', customer.email)
                .is('stripe_customer_id', null);
            if (error) {
                console.error(`Webhook Error: Failed linking customer ${customer.id} to profile by email ${customer.email}:`, error);
            } else {
                 console.log(`Webhook: Successfully linked customer ${customer.id} via email.`);
            }
         }
         break;
       }
      default:
        console.log(`Webhook: Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
      console.error("Webhook Error: Error handling Stripe event:", error);
      if (error.type && error.statusCode) {
          return NextResponse.json({ error: { message: `Stripe API Error: ${error.message}` } }, { status: error.statusCode });
      }
      return NextResponse.json({ error: { message: `Webhook handler error: ${error.message || 'Unknown error'}` } }, { status: 500 });
  }
}
// --- End Webhook Handler ---
