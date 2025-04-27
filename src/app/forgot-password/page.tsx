'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient'; // Assuming client is configured

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    // Basic client-side validation
    if (!email) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    try {
        // Call Supabase directly from client-side to request password reset email
        // Ensure your Supabase project has email templates configured for password resets.
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            // Redirect URL for the link in the email
            // This should point to your dedicated reset password page
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (resetError) {
            throw resetError;
        }

        setMessage('Password reset email sent! Please check your inbox (and spam folder) for instructions.');

    } catch (err: any) {
        console.error("Password reset request error:", err);
        setError(err.message || 'Failed to send password reset email. Please try again.');
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
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
            <p className="text-gray-400">Enter your email to receive reset instructions.</p>
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

          {!message && ( // Hide form after success message
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your account email"
                  className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
