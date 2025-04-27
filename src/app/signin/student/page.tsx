'use client';

import React from 'react';
import Link from 'next/link'; // Import Link

import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function StudentSignIn() {
  const [usernameInput, setUsernameInput] = useState(''); // Renamed state
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const usernameOrEmail = usernameInput.trim(); // Use renamed state
    const userPassword = password;

    let signInEmail: string;
    // Check if the input is not an email (doesn't contain '@'), assume it's a username
    if (!usernameOrEmail.includes('@')) {
      // Construct the dummy email using the username convention
      signInEmail = `${usernameOrEmail.toLowerCase()}@managed.principia.ai`;
      console.log("Attempting sign-in with constructed dummy email:", signInEmail);
    } else {
      // Assume it's a real email
      signInEmail = usernameOrEmail;
      console.log("Attempting sign-in with provided email:", signInEmail);
    }

    // Remove the unnecessary profile query here

    const { error, data } = await supabase.auth.signInWithPassword({
      email: signInEmail, // Use the determined email (real or dummy)
      password: userPassword,
    });

    console.log("Sign-in response:", { error, data });

    if (error) {
      setIsLoading(false);
      setError("Wrong password, try again");
    } else if (data && data.session) {
      // Check if the user has the 'student' role
      const { data: profileDataArray, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .limit(1);

      console.log("Profile fetch response:", { profileDataArray, profileError });

      if (profileError) {
        setIsLoading(false);
        setError("Warning: Unable to verify student status due to error: " + profileError.message + ". Proceeding to dashboard for debugging.");
        console.log("Proceeding to chat despite profile fetch error for user ID:", data.user.id);
        // Delay redirect to ensure error message is visible
        setTimeout(() => {
          window.location.href = '/chat';
        }, 2000);
      } else if (!profileDataArray || profileDataArray.length === 0) {
        setIsLoading(false);
        setError("Warning: No profile found for this account. Proceeding to dashboard for debugging.");
        console.log("No profile found for user ID:", data.user.id, ". Proceeding to chat.");
        // Delay redirect to ensure error message is visible
        setTimeout(() => {
          window.location.href = '/chat';
        }, 2000);
      } else if (profileDataArray[0].role !== 'student') {
        setIsLoading(false);
        setError("Access denied: This account is registered as '" + (profileDataArray[0].role || 'unknown') + "', not as a student.");
        await supabase.auth.signOut(); // Log out if not a student
      } else {
        // Set role cookie for middleware
        document.cookie = "role=student; path=/; max-age=86400"; // 1 day expiry
        window.location.href = '/chat';
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
            <h1 className="text-3xl font-bold text-white mb-2">Student Sign In</h1>
            <p className="text-gray-400">Sign in to access your learning resources</p>
          </div>

          {error && (
            <div className="text-center text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-md p-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="mt-8 space-y-4">
            <div>
            <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-300 mb-1">Username or Email</label> {/* Updated label */}
            <Input
              id="usernameOrEmail" // Updated id
              type="text"
              value={usernameInput} // Use renamed state
              onChange={(e) => setUsernameInput(e.target.value)} // Update renamed state
              required 
              placeholder="Enter your email or username" 
              className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3" 
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
                className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3" 
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
