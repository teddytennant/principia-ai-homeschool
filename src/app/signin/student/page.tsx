'use client';

import React from 'react';

import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function StudentSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = email.trim();
    const userPassword = password;

    const { error, data } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });

    console.log("Sign-in response:", { error, data });

    if (error) {
      alert('Sign-in failed: ' + error.message);
    } else if (data && data.session) {
      // Only redirect if session exists
      window.location.href = '/chat';
    } else {
      alert('Sign-in failed: No session returned. Please check your credentials and Supabase configuration.');
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
            <p className="text-gray-400 text-sm mt-2">Your username and password will be given to you by your teacher or school district.</p>
          </div>

          <form onSubmit={handleEmailSignIn} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="Enter your email address" 
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition-all duration-300 shadow-md"
            >
              Sign in
            </Button>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
