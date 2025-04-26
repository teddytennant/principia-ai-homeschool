import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
// The library will use its default API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json(); // Get the Price ID from the request body

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Use environment variable or default to localhost for local development
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log(`Using base URL for Stripe redirects: ${baseUrl}`); // Add logging for debugging
    const successUrl = `${baseUrl}/`; // Redirect to home page on success
    const cancelUrl = `${baseUrl}/pricing`; // Redirect back to pricing page on cancellation

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Use 'subscription' for recurring payments
      success_url: successUrl,
      cancel_url: cancelUrl,
      // You might want to associate the checkout session with the logged-in user
      // customer_email: userEmail, // Pass user's email if available
      // client_reference_id: userId, // Pass user's ID if available
      // metadata: { userId: userId }, // Store user ID in metadata
    });

    if (!session.id) {
        throw new Error('Failed to create Stripe session.');
    }

    // Return the session ID to the client
    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
