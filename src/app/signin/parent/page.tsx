'use client';

import React, { useState } from 'react';
import Link from 'next/link'; // Import Link component
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/lib/supabaseClient';
import { Input } from "@/components/ui/input"; // Import Input component

export default function ParentSignIn() { // Renamed component to ParentSignIn
  const [email, setEmail] = useState(''); // Changed state variable name for clarity
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Assuming teachers use email for login
    const userEmail = email.trim(); // Use email state variable

    const { error, data } = await supabase.auth.signInWithPassword({
      email: userEmail, // Use trimmed email
      password: password,
    });

    console.log("Sign-in attempt with email:", userEmail);
    console.log("Sign-in response:", { error, data });

    if (error) {
      console.error("Sign-in error details:", error);
      setIsLoading(false);
      setError("Sign-in failed. Please check your email and password."); // More user-friendly error
    } else if (data && data.session) {
      // Fetch profile and check role
      try {
        const { data: profileDataArray, error: profileError } = await supabase
          .from('profiles')
          .select('role') // Select the role column
          .eq('id', data.user.id)
          .limit(1);

        if (profileError) {
          setIsLoading(false);
          setError("Warning: Unable to verify parent status due to error: " + profileError.message + "."); // Updated error message context to parent
          await supabase.auth.signOut();
        } else if (!profileDataArray || profileDataArray.length === 0) {
          setIsLoading(false);
          setError("No profile found for this account. Please contact support.");
          await supabase.auth.signOut();
        } else if (profileDataArray[0].role !== 'parent') { // Check for 'parent' role
          setIsLoading(false);
          setError("Access denied: This account is registered as '" + (profileDataArray[0].role || 'unknown') + "', not as a parent."); // Updated error message to parent
          await supabase.auth.signOut();
        } else {
          // Role is parent, proceed
          setTimeout(() => {
            console.log("Attempting redirect to parent dashboard..."); // Updated log message to parent
            // Set role cookie for middleware
            // Set access token and role cookies for middleware
            const accessToken = data.session.access_token;
            document.cookie = `sb-access-token=${accessToken}; path=/; SameSite=Lax; max-age=86400`; // Set access token cookie
            document.cookie = "role=parent; path=/; SameSite=Lax; max-age=86400"; // Set role cookie to 'parent'
            window.location.replace('/parent/dashboard'); // Redirect to parent dashboard
          }, 100);
        }
      } catch (err) {
        console.error('Error during role verification:', err);
        setIsLoading(false);
        setError("Unexpected error during role verification. Please try again.");
        await supabase.auth.signOut();
      }
    } else {
      setIsLoading(false);
      setError("Sign-in failed: No session returned. Please check your credentials.");
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
          className="w-full max-w-md p-8 space-y-8 bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-lg shadow-indigo-500/20"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Parent Sign In</h1> {/* Updated title to Parent */}
            <p className="text-gray-400">Sign in to manage your students.</p> {/* Updated description */}
          </div>

          {error && (
            <div className="text-center text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-md p-2">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label> {/* Changed htmlFor */}
              <Input
                id="email" // Changed id
                type="email"
                value={email} // Use email state variable
                onChange={(e) => setEmail(e.target.value)} // Update email state
                required
                placeholder="Enter your email"
                className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3 px-3"
                autoComplete="email" // Changed autocomplete
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3 px-3"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition-all duration-300 shadow-md"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
             <div className="text-center mt-4">
                <Link href="/forgot-password" className="text-sm text-indigo-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
