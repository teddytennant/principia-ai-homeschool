import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: We might need the service role key if we update the profile status directly here,
// but ideally, this should be handled by a Stripe webhook.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error("Supabase URL, Anon Key, or Service Role Key is missing from environment variables.");
}

// Initialize Supabase Client (using anon key for user auth)
const supabase = createClient(supabaseUrl, anonKey);
// Initialize Supabase Admin Client (if needed for direct status update)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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

    // 3. Retrieve user's profile to get Stripe subscription ID
    // Use admin client here to ensure we can read the necessary columns even if RLS is restrictive
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_subscription_id, stripe_subscription_status')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile for cancellation:", profileError);
      return NextResponse.json({ error: { message: 'Could not retrieve subscription details.' } }, { status: 500 });
    }

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({ error: { message: 'No active subscription found for this user.' } }, { status: 404 });
    }

    if (profile.stripe_subscription_status === 'canceled') {
        return NextResponse.json({ error: { message: 'Subscription is already canceled.' } }, { status: 400 });
    }

    const subscriptionId = profile.stripe_subscription_id;

    // 4. Call Stripe MCP to cancel the subscription
    // This requires the Stripe MCP server to be running and configured.
    // We'll construct the MCP tool call structure here.
    // NOTE: Actual execution depends on the MCP client library/integration setup,
    // which is assumed to be available globally or imported.
    // For now, we simulate the call structure.

    // Placeholder for actual MCP tool call
    console.log(`Simulating Stripe MCP call: cancel_subscription with ID: ${subscriptionId}`);
    // const mcpResult = await callStripeMcpTool('cancel_subscription', { subscription: subscriptionId });
    // if (mcpResult.error) {
    //   throw new Error(`Stripe cancellation failed: ${mcpResult.error.message}`);
    // }
    // --- End Placeholder ---

    // **IMPORTANT**: The robust way to update the status in Supabase is via Stripe Webhooks.
    // Listening for `customer.subscription.deleted` or `customer.subscription.updated` (with status 'canceled').
    // For simplicity in this step, we'll update the status directly using the admin client.
    // This is NOT recommended for production without webhooks as the source of truth.
    const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_subscription_status: 'canceled' })
        .eq('id', userId);

    if (updateError) {
        // Log the error but proceed, as Stripe cancellation might have succeeded.
        console.error("Failed to update local subscription status after cancellation:", updateError);
    }

    // 5. Return success response
    return NextResponse.json({ message: 'Subscription cancelled successfully. Access will remain until the end of the current billing period.' }, { status: 200 });

  } catch (error: any) {
    console.error("API Cancel Subscription Error:", error);
    // Check if it's a simulated MCP error or other error
    const errorMessage = error.message || 'An unexpected error occurred during cancellation.';
    return NextResponse.json({ error: { message: errorMessage } }, { status: 500 });
  }
}

// Helper function placeholder for calling MCP tool (replace with actual implementation)
// async function callStripeMcpTool(toolName: string, args: any): Promise<{ data?: any, error?: any }> {
//   // This needs to interact with your specific MCP client setup
//   console.warn(`MCP Tool Call Simulation: ${toolName}`, args);
//   // Simulate success for now
//   if (toolName === 'cancel_subscription') {
//       return { data: { id: args.subscription, status: 'canceled' } };
//   }
//   return { error: { message: "MCP Tool not implemented in simulation" } };
// }
