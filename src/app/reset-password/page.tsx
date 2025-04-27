'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook to read query params (though Supabase uses fragment)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true); // State to check if token is valid

  // Supabase password reset uses URL fragments (#access_token=...), not query params.
  // We need to parse the fragment client-side.
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // Remove '#' and parse
    const accessToken = params.get('access_token');
    const errorDescription = params.get('error_description');

    if (errorDescription) {
        setError(`Error verifying reset token: ${errorDescription}`);
        setIsVerifying(false);
    } else if (!accessToken) {
        // This might happen if the user navigates directly without the token
        // Or if the token expired before the page loaded fully.
        // Supabase handles token verification on updateUser call anyway.
        console.warn("No access token found in URL fragment. Update might fail if not logged in via link.");
        setIsVerifying(false); // Allow attempting update, Supabase will verify token
    } else {
        // Token found in fragment, proceed
        setIsVerifying(false);
    }

    // Listen for PASSWORD_RECOVERY event which happens after successful reset via email link
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
            // User is logged in via the recovery link, ready to update password
            console.log("Password recovery event detected.");
            setIsVerifying(false);
        }
    });

    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, []);


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
        // Update the user's password. Supabase verifies the session/token internally.
        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        });

        if (updateError) {
            throw updateError;
        }

        setMessage('Password updated successfully! You can now sign in with your new password.');
        // Optionally redirect to sign-in page after a delay
        setTimeout(() => router.push('/signin/student'), 3000); // Redirect after 3s

    } catch (err: any) {
        console.error("Password update error:", err);
        setError(err.message || 'Failed to update password. The reset link may have expired.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16 md:py-24 bg-gradient-to-br from-black via-gray-900 to-indigo-900/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 space-y-6 bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-lg shadow-indigo-500/20"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-gray-400">Enter your new password below.</p>
          </div>

          {message && (
            <div className="text-center text-green-400 text-sm font-medium bg-green-500/10 border border-green-500/20 rounded-md p-3">
              {message}
            </div>
          )}
          {error && (
            <div className="text-center text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-md p-2">
              {error}
            </div>
          )}

          {isVerifying && (
             <p className="text-center text-gray-400">Verifying reset link...</p>
          )}

          {!isVerifying && !message && ( // Hide form after success/final error
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password (min. 6 chars)"
                  className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3"
                />
              </div>
               <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting..." : "Set New Password"}
              </Button>
            </form>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
