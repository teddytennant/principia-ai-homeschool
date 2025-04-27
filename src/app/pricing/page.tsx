'use client'; // Use client for animations and Stripe interaction

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { loadStripe, Stripe } from '@stripe/stripe-js'; // Import Stripe
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
// Removed import { ENABLE_PAYWALL_CHECK } from '@/middleware'; // Cannot import directly
import { Button } from "@/components/ui/button"; // Standard button
import { ButtonColorful } from "@/components/ui/button-colorful"; // Colorful button
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Plan pricing (monthly/yearly)
const PRICING = {
  family: { monthly: 49, yearly: 499 }, // $49/mo or $499/yr
  coop: { monthly: 179, yearly: 1799 }, // $179/mo or $1799/yr
  individual: { monthly: 19, yearly: 199 }, // $19/mo or $199/yr
};

// --- Stripe Price IDs ---
const STRIPE_PRICE_IDS = {
  family: { monthly: 'price_1RHqp5JeqDgVC0pzC2syW4AK', yearly: 'price_1RHtQ6JeqDgVC0pzzTsrMKrw' },
  coop: { monthly: 'price_1RHtHgJeqDgVC0pzMfSjR81F', yearly: 'price_1RHtOpJeqDgVC0pzI0ombSIs' },
  individual: { monthly: 'price_1RHtE3JeqDgVC0pz1vqgNtO1', yearly: 'price_1RHtO1JeqDgVC0pzn7FOz15G' },
};
// --- End Stripe Price IDs ---

const formatPrice = (amount: number) => `$${amount.toLocaleString()}`;

// Load Stripe instance (outside component to avoid reloading)
// Ensure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in your .env.local
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);


// Pricing Card Component
interface PricingCardProps {
  planKey: 'family' | 'coop' | 'individual'; // Added key to identify plan
  planName: string;
  price: string;
  frequency?: string;
  description: string;
  features: string[];
  ctaText: string;
  // Removed ctaHref as it's handled by onClick now
  isFeatured?: boolean; // Optional flag for highlighting a plan
  isContact?: boolean; // Flag for contact button
  onCheckout: (priceId: string, planKey: 'family' | 'coop' | 'individual') => void; // Updated callback signature
  priceId: string; // Pass the relevant price ID
}

const PricingCard: React.FC<PricingCardProps & { savings?: string }> = ({
  planKey, // Destructure planKey
  planName,
  price,
  frequency = "/month",
  description,
  features,
  ctaText,
  isFeatured,
  isContact,
  savings,
  onCheckout, // Destructure onCheckout
  priceId // Destructure priceId
}) => {
  const cardVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0,
        duration: 0,
        ease: "easeOut"
      }
    }
  };
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        scale: 1.04,
        boxShadow: "0 0 30px rgba(79, 70, 229, 0.4)",
        transition: { duration: 0.2 }
      }}
      className={`border rounded-2xl p-8 flex flex-col shadow-lg transition-all duration-300 ${isFeatured ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-gradient-to-b from-gray-900/40 to-indigo-900/20 shadow-xl shadow-indigo-500/30 scale-105 z-10' : 'border-gray-700 bg-gray-900/70 shadow-md shadow-gray-800/30'}`}
    >
      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{planName}</h3>
      <p className="text-gray-400 mb-4 text-base leading-relaxed">{description}</p>
      <div className="mb-4 flex flex-col items-center justify-center gap-1">
        {frequency === '/year' ? (
          <>
            <span className="text-4xl font-bold text-white">{formatPrice(Math.round(Number(price.replace(/[^\d.]/g, ''))/12*100)/100)}/mo</span>
            <span className="text-xs text-gray-400">billed yearly</span>
          </>
        ) : (
          <span className="text-4xl font-bold text-white">{price}{frequency}</span>
        )}
      </div>
      {savings && (
        <div className="text-green-400 text-xs font-semibold mb-2 text-center">{savings}</div>
      )}
      <ul className="space-y-2 text-gray-300 mb-6 flex-grow text-left mx-auto max-w-xs">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <CheckCircle className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      {isContact ? (
        <ButtonColorful label={ctaText} className="w-full mt-auto py-3 text-base rounded-full shadow-md shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all duration-300" onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))} />
      ) : (
        <Button
          variant="outline"
          className="w-full mt-auto py-3 text-base bg-indigo-600 hover:bg-indigo-700 border-none text-white rounded-full font-bold shadow-xl shadow-indigo-500/40 transition-all duration-300"
          onClick={() => onCheckout(priceId, planKey)} // Pass both priceId and planKey
        >
          {ctaText}
        </Button>
      )}
    </motion.div>
  );
};

// Pricing Page Component
export default function PricingPage() {
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0
      }
    }
  };

  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for errors
  const router = useRouter(); // Initialize router

  // Checkout handler function
  const handleCheckout = async (priceId: string, planKey: 'family' | 'coop' | 'individual') => {
    setIsLoading(true);
    setError(null);

    // --- REMOVED Client-side Authentication Check ---
    // Relying solely on middleware after redirect.

    // --- Check Paywall Environment Variable ---
    const envVarValue = process.env.NEXT_PUBLIC_ENABLE_PAYWALL_CHECK;
    console.log(`Read NEXT_PUBLIC_ENABLE_PAYWALL_CHECK: "${envVarValue}" (type: ${typeof envVarValue})`);
    const paywallEnabled = envVarValue !== 'false'; // Default to true if not set or not 'false'
    console.log(`Paywall enabled flag evaluated to: ${paywallEnabled}`);

    if (!paywallEnabled) {
      // --- Paywall Disabled: Call API to handle redirect ---
      console.log('Paywall check disabled via environment variable. Calling /api/select-plan.');
      try {
        const apiResponse = await fetch('/api/select-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planKey }), // Send the selected plan key
        });

        // Check if the API responded with an error (e.g., user wasn't actually authenticated server-side)
        if (!apiResponse.ok || apiResponse.redirected) {
           // If redirected, the browser will follow it automatically.
           // If not ok, maybe show an error, but typically the redirect handles it.
           console.log('API call finished or redirected.');
        } else {
           // Handle unexpected non-redirect response if necessary
           setError('Plan selection failed. Please try again.');
           console.error('Unexpected response from /api/select-plan:', apiResponse);
        }
      } catch (apiError) {
        console.error('Error calling /api/select-plan:', apiError);
        setError('An error occurred during plan selection.');
      } finally {
        setIsLoading(false);
      }
      return; // Stop execution here, let the API handle the redirect
    }
    // --- End Paywall Disabled Logic ---

    // --- Paywall Enabled: Proceed with Stripe ---
    console.log('Paywall check enabled via environment variable. Proceeding with Stripe checkout.');
    if (!stripePromise) {
      setError("Stripe is not configured correctly. Missing publishable key.");
      setIsLoading(false);
      return;
    }

    const stripe = await stripePromise;
    if (!stripe) {
      setError("Failed to initialize Stripe.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create a checkout session on your server
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const { error: apiError } = await response.json();
        throw new Error(apiError || 'Failed to create checkout session.');
      }

      const { sessionId } = await response.json();

      // 2. Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

      if (stripeError) {
        console.error("Stripe Redirect Error:", stripeError);
        setError(stripeError.message || "Failed to redirect to Stripe.");
      }
      // If redirect is successful, the user leaves this page.
      // If they cancel, they are redirected back to the cancelUrl (pricing page).
      // If successful, they are redirected to the successUrl (currently /chat).

    } catch (err) {
      console.error("Checkout Error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false); // Ensure loading is set to false even on error
    }
    // --- End Paywall Enabled Logic ---
  };


  const plans = [
    {
      planKey: 'family' as const, // Add planKey
      planName: "Family Plan",
      price: formatPrice(billing === 'monthly' ? PRICING.family.monthly : PRICING.family.yearly),
      frequency: billing === 'monthly' ? "/month" : "/year",
      description: "One subscription covers your whole family. Best for up to 5 learners.",
      features: [
        "Up to 5 learners included",
        "Personalized AI tutoring for each child",
         "Parent dashboard & progress tracking",
         "Flexible curriculum options",
         "Socratic Tutor sessions (Fair Use: 500 messages/day)",
         "Priority family support",
       ],
      savings: billing === 'yearly' ? `Save $89/year` : undefined,
      ctaText: isLoading ? "Processing..." : `Start Family Plan`, // Update CTA text when loading
      // Removed ctaHref
      isFeatured: true,
      isContact: false,
    },
    {
      planKey: 'coop' as const, // Add planKey
      planName: "Co-op Plan",
      price: formatPrice(billing === 'monthly' ? PRICING.coop.monthly : PRICING.coop.yearly),
      frequency: billing === 'monthly' ? "/month" : "/year",
      description: "Empower your homeschool co-op with group management and collaboration.",
      features: [
        "Up to 25 learners",
        "Group assignments & projects",
         "Co-op admin dashboard",
         "Shared resources & lesson planning",
         "Socratic Tutor sessions (Fair Use: 500 messages/day)",
         "Priority onboarding for co-ops",
       ],
      savings: billing === 'yearly' ? `Save $349/year` : undefined,
      ctaText: isLoading ? "Processing..." : `Start Co-op Plan`, // Update CTA text when loading
      // Removed ctaHref
      isFeatured: false,
      isContact: false,
    },
    {
      planKey: 'individual' as const, // Add planKey
      planName: "Individual Learner",
      price: formatPrice(billing === 'monthly' ? PRICING.individual.monthly : PRICING.individual.yearly),
      frequency: billing === 'monthly' ? "/month" : "/year",
      description: "Affordable access for solo homeschoolers or supplemental learning.",
      features: [
        "Single learner access",
         "AI tutoring",
         "Progress tracking",
         "Socratic Tutor sessions (Fair Use: 500 messages/day)",
         "Standard support",
       ],
      savings: billing === 'yearly' ? `Save $29/year` : undefined,
      ctaText: isLoading ? "Processing..." : `Start Individual Plan`, // Update CTA text when loading
      // Removed ctaHref
      isFeatured: false,
      isContact: false,
    },
  ];


  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('openContactModal', handleOpenModal);
    return () => window.removeEventListener('openContactModal', handleOpenModal);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle form submission, e.g., send data to an API
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-900/30 text-gray-100 py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight">Simple, Transparent Pricing</h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto mb-6">Choose the plan that fits your homeschool journey. Save up to 20% with yearly billing!</p>
          {error && ( // Display error messages
            <div className="mb-4 text-center text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-md p-2 max-w-md mx-auto">
              {error}
            </div>
          )}
          <div className="inline-flex items-center justify-center bg-gray-800 rounded-full px-2 py-1 mb-2">
            <button
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${billing==='monthly' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
              onClick={() => setBilling('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${billing==='yearly' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
              onClick={() => setBilling('yearly')}
            >
              Yearly <span className="ml-1 text-xs text-green-400">(Save!)</span>
            </button>
          </div>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          {plans.map((plan) => {
            // Determine the correct price ID based on selected billing cycle
            const priceId = STRIPE_PRICE_IDS[plan.planKey][billing];
            return (
              <PricingCard
                key={plan.planName}
                {...plan}
                priceId={priceId} // Pass the determined price ID
                onCheckout={handleCheckout} // Pass the checkout handler
              />
            );
          })}
        </motion.div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 p-8 rounded-xl max-w-md w-full shadow-xl shadow-indigo-500/20 border border-gray-700/50"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Contact Sales</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-6">Please fill out the form below, and our team will get back to you as soon as possible.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">District Email</label>
                <Input id="email" type="email" placeholder="your.district@email.com" required className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <Textarea id="message" placeholder="Tell us about your needs or inquiries..." required className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3" rows={5} />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md">Send Message</Button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
