"use client";

import React, { useState, useEffect } from 'react';
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnUrl = searchParams.get('returnUrl');

  useEffect(() => {
    if (returnUrl) {
      console.log('Return URL detected:', returnUrl);
    }
  }, [returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", { username, password, redirect: false });
      if (result?.error) {
        setError('Invalid username or password. Please try again.');
        setIsLoading(false);
      } else {
        if (returnUrl) {
          router.push(decodeURIComponent(returnUrl));
        } else {
          router.push('/parent/dashboard');
        }
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred during sign-in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-900/30 text-gray-100 flex flex-col items-center justify-center py-20 px-4 overflow-hidden h-screen w-screen fixed top-0 left-0">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white tracking-tight">Sign In</h1>
        <p className="text-lg text-gray-300 mb-8">Use the username and password provided by your teacher or district.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <Input 
              id="username" 
              type="text" 
              placeholder="Enter your username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3" 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full bg-gray-800 border-gray-700 text-white rounded-md py-3" 
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
