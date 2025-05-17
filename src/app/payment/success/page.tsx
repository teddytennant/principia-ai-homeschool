'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Import supabase for token

// Define a component that uses useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setErrorMessage('Missing payment session information.');
      return;
    }

    const verifyPayment = async () => {
      setStatus('loading');
      setErrorMessage(null);
      try {
        // Attempt to verify payment without requiring an active session
        console.log('Attempting payment verification, session check bypassed...');
        const response = await fetch('/api/payment/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Payment verification failed.');
        }

        // Verification successful, redirect to dashboard with a query parameter to bypass auth check
        setStatus('success');
        console.log('Payment verified successfully, redirecting to dashboard with bypass parameter...');
        // Redirect to the parent dashboard with a parameter to bypass auth redirect
        router.push('/parent/dashboard?fromPayment=true');

      } catch (err: any) {
        console.error("Payment verification error:", err);
        setStatus('error');
        setErrorMessage(err.message || 'An error occurred while verifying your payment.');
      }
    };

    verifyPayment();

  }, [searchParams, router]); // Re-run if searchParams change

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center p-4">
      {status === 'loading' && (
        <>
          <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-6" />
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Verifying Payment...</h1>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we confirm your subscription activation.</p>
        </>
      )}
      {status === 'success' && (
         <>
           {/* Optional: Show success briefly before redirect */}
           <h1 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-2">Payment Successful!</h1>
           <p className="text-gray-600 dark:text-gray-400">Redirecting you to your dashboard...</p>
           <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mt-4" />
         </>
      )}
      {status === 'error' && (
        <div className="p-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
          <h1 className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-2">Verification Failed</h1>
          <p className="text-red-600 dark:text-red-300">{errorMessage || 'An unknown error occurred.'}</p>
          {errorMessage && errorMessage.includes('sign in') && (
            <button 
              onClick={() => {
                const returnUrl = encodeURIComponent(window.location.href);
                router.push(`/signin?returnUrl=${returnUrl}`);
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Sign In Now
            </button>
          )}
        </div>
      )}
    </div>
  );
}


// Wrap SuccessContent in Suspense as useSearchParams requires it
export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <SuccessContent />
        </Suspense>
    );
}
